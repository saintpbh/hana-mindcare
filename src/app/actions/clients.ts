'use server'

import { prisma } from '@/lib/prisma'
import { Client, Prisma } from '@prisma/client'
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
                },
                sessions: {
                    orderBy: { date: 'desc' },
                    take: 5
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

export async function createClient(data: Prisma.ClientCreateInput) {
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

export async function createQuickNote(clientName: string | null, content: string) {
    try {
        let clientId: string | null = null;
        let finalClientName: string | null = null;

        if (clientName) {
            const client = await prisma.client.findFirst({
                where: {
                    name: { contains: clientName, mode: 'insensitive' }
                }
            });
            if (client) {
                clientId = client.id;
                finalClientName = client.name;
            }
        }

        const note = await prisma.quickNote.create({
            data: {
                content,
                clientId: clientId
            },
            include: {
                client: {
                    select: { name: true }
                }
            }
        });

        revalidatePath('/');
        revalidatePath('/mobile-admin');
        return { success: true, data: { note, clientName: finalClientName } };
    } catch (error) {
        console.error('Failed to create quick note:', error);
        return { success: false, error: 'Failed to create quick note' };
    }
}

export async function getRecentQuickNotes(limit: number = 10) {
    try {
        const notes = await prisma.quickNote.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                client: {
                    select: { id: true, name: true }
                }
            }
        });
        return { success: true, data: notes };
    } catch (error) {
        console.error('Failed to fetch recent quick notes:', error);
        return { success: false, error: 'Failed to fetch recent quick notes' };
    }
}

export async function getAllQuickNotes() {
    try {
        const notes = await prisma.quickNote.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: { id: true, name: true }
                }
            }
        });
        return { success: true, data: notes };
    } catch (error) {
        console.error('Failed to fetch all quick notes:', error);
        return { success: false, error: 'Failed to fetch all quick notes' };
    }
}

export async function updateQuickNote(id: string, content: string) {
    try {
        const note = await prisma.quickNote.update({
            where: { id },
            data: { content }
        });
        revalidatePath('/');
        return { success: true, data: note };
    } catch (error) {
        console.error('Failed to update quick note:', error);
        return { success: false, error: 'Failed to update quick note' };
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
export async function restartClient(id: string) {
    try {
        const client = await prisma.client.update({
            where: { id },
            data: {
                status: 'stable',
                terminatedAt: null
            }
        });
        revalidatePath('/');
        return { success: true, data: client };
    } catch (error) {
        console.error('Failed to restart client:', error);
        return { success: false, error: 'Failed to restart counseling' };
    }
}
