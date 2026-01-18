'use server'

import { prisma } from '@/lib/prisma'
import { Client } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getClients() {
    try {
        // Lazy cleanup: Delete notes older than 30 days
        await prisma.quickNote.deleteMany({
            where: {
                deletedAt: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const clients = await prisma.client.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                quickNotes: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        return { success: true, data: clients }
    } catch (error) {
        console.error('Failed to fetch clients:', error)
        return { success: false, error: 'Failed to fetch clients' }
    }
}

export async function updateClient(id: string, data: Partial<Client>) {
    try {
        const client = await prisma.client.update({
            where: { id },
            data,
        })
        revalidatePath('/')
        revalidatePath('/mobile-admin')
        return { success: true, data: client }
    } catch (error) {
        console.error('Failed to update client:', error)
        return { success: false, error: 'Failed to update client' }
    }
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
        const client = await prisma.client.create({
            data,
        })
        revalidatePath('/')
        return { success: true, data: client }
    } catch (error) {
        console.error('Failed to create client:', error)
        return { success: false, error: 'Failed to create client' }
    }
}

export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({
            where: { id }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete client:', error);
        return { success: false, error: 'Failed to delete client' };
    }
}

export async function terminateClient(id: string) {
    try {
        const client = await prisma.client.update({
            where: { id },
            data: {
                status: 'terminated',
                terminatedAt: new Date()
            }
        });
        revalidatePath('/');
        return { success: true, data: client };
    } catch (error) {
        console.error('Failed to terminate client:', error);
        return { success: false, error: 'Failed to terminate client' };
    }
}

// ... existing imports

export async function createQuickNote(clientName: string, content: string) {
    try {
        const client = await prisma.client.findFirst({
            where: {
                name: { contains: clientName, mode: 'insensitive' }
            }
        });

        if (!client) {
            return { success: false, error: 'Client not found' };
        }

        const note = await prisma.quickNote.create({
            data: {
                content,
                clientId: client.id
            }
        });

        revalidatePath('/patients/[id]'); // Revalidate dynamic patient pages
        return { success: true, data: { note, clientName: client.name } };
    } catch (error) {
        console.error('Failed to create quick note:', error);
        return { success: false, error: 'Failed to create quick note' };
    }
}

export async function createQuickNoteById(clientId: string, content: string) {
    try {
        const note = await prisma.quickNote.create({
            data: {
                content,
                clientId
            }
        });

        revalidatePath(`/patients/${clientId}`);
        return { success: true, data: note };
    } catch (error) {
        console.error('Failed to create quick note by ID:', error);
        return { success: false, error: 'Failed to create quick note' };
    }
}

export async function getClientWithHistory(id: string) {
    console.log(`[getClientWithHistory] Fetching for ID: "${id}"`); // Quote to see whitespace
    try {
        const cleanId = id.trim();

        // Step 1: Try Basic Fetch (No Relations)
        const basicClient = await prisma.client.findFirst({
            where: { id: cleanId }
        });

        if (!basicClient) {
            console.log(`[getClientWithHistory] Client not found (basic fetch) for ID: ${cleanId}`);
            return { success: false, error: 'Client not found (basic fetch failed)' };
        }

        // Step 2: Try Fetch with Relations
        // We explicitly type the include to match Prisma Generated types if possible, or just rely on runtime
        try {
            const clientWithRelations = await prisma.client.findFirst({
                where: { id: cleanId },
                include: {
                    sessions: {
                        orderBy: { date: 'desc' }
                    },
                    quickNotes: {
                        where: { deletedAt: null },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!clientWithRelations) {
                // Should ideally not happen if basic fetch passed, unless race condition
                return { success: true, data: basicClient }; // Fallback to basic
            }

            console.log(`[getClientWithHistory] Found client with relations: ${clientWithRelations.name}`);
            return { success: true, data: clientWithRelations };

        } catch (relationError: any) {
            console.error('[getClientWithHistory] Relation fetch failed:', relationError);
            // Return basic client if relations fail (e.g. schema mismatch), but add empty arrays/props to satisfy UI types
            const fallbackClient = {
                ...basicClient,
                sessions: [],
                quickNotes: []
            };
            return { success: true, data: fallbackClient };
        }

    } catch (error: any) {
        console.error('[getClientWithHistory] Error:', error);
        // Expose the actual error for debugging
        return {
            success: false,
            error: `Failed to fetch client history: ${error?.message || String(error)}`
        };
    }
}

export async function deleteQuickNote(id: string) {
    try {
        await prisma.quickNote.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        revalidatePath('/patients/[id]');
        revalidatePath('/mobile-admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete quick note:', error);
        return { success: false, error: 'Failed to delete quick note' };
    }
}

export async function restoreQuickNote(id: string) {
    try {
        await prisma.quickNote.update({
            where: { id },
            data: { deletedAt: null }
        });
        revalidatePath('/patients/[id]');
        revalidatePath('/mobile-admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to restore quick note:', error);
        return { success: false, error: 'Failed to restore quick note' };
    }
}
