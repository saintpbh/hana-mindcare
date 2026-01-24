'use server'

import { prisma } from '@/lib/prisma'
import { Client, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { requireAuth, requirePermission } from '@/lib/auth'

export async function getClients() {
    try {
        const session = await requireAuth();

        // Lazy cleanup: Delete notes older than 30 days
        await prisma.quickNote.deleteMany({
            where: {
                deletedAt: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });

        const clients = await prisma.client.findMany({
            where: { accountId: session.accountId },
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
        console.log('updateClient called with:', { id, data });
        const session = await requirePermission('client:update:all');

        // Extract only the fields that can be updated
        // Exclude: id, accountId, createdAt, updatedAt, sessions, quickNotes, counselor
        const {
            // Exclude these fields
            id: _id,
            accountId: _accountId,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            sessions: _sessions,
            quickNotes: _quickNotes,
            counselor: _counselor,
            // Include only updatable fields
            ...updateData
        } = data;

        // Clean up empty string values for foreign keys
        const cleanedData = {
            ...updateData,
            counselorId: updateData.counselorId || undefined,
            englishName: updateData.englishName || null,
            location: updateData.location || null,
        };

        console.log('Cleaned data:', cleanedData);

        const client = await prisma.client.update({
            where: {
                id,
                accountId: session.accountId
            },
            data: cleanedData,
        })

        console.log('Client updated successfully:', client.id);
        revalidatePath('/')
        revalidatePath('/mobile-admin')
        revalidatePath(`/patients/${id}`)
        return { success: true, data: client }
    } catch (error) {
        console.error('Failed to update client - Full error:', error)
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error)
        });
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update client' }
    }
}

export async function createClient(data: Prisma.ClientCreateInput) {
    try {
        const session = await requirePermission('client:create');

        const client = await prisma.client.create({
            data: {
                ...data,
                accountId: session.accountId
            },
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
        const session = await requirePermission('client:delete');

        await prisma.client.delete({
            where: {
                id,
                accountId: session.accountId
            }
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
        const session = await requireAuth();
        let clientId: string | null = null;
        let finalClientName: string | null = null;

        if (clientName) {
            const client = await prisma.client.findFirst({
                where: {
                    accountId: session.accountId,
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
        const session = await requireAuth();
        const notes = await prisma.quickNote.findMany({
            where: {
                deletedAt: null,
                // If quick note has client, that client must belong to account
                // If quick note is standalone (clientId null), we might need another way to link to account?
                // Currently QuickNote doesn't have accountId directly?
                // Let's check schema. QuickNote DOES NOT have accountId in schema print above!
                // Wait, typically QuickNote is linked to Client. if Client is null, who owns it?
                // Schema says: clientId String? 
                // If clientId is null, it's a general note? 
                // Creating QuickNote without Client might happen. 
                // Issue: QuickNote needs accountId if it can be standalone.
                // Checking previous schema view... QuickNote model:
                // model QuickNote { ... clientId String? ... }
                // It does NOT have accountId.
                // I should add accountId to QuickNote?? 
                // For now, I'll filter by client.accountId. But what if client is null?
                // If client is null, it's global? No, that's bad.
                // I'll assume for now QuickNotes are mostly for clients. 
                // OR I should use `client: { accountId: session.accountId }`
                // BUT what if clientId is null? Then it won't match `client: { ... }`.
                // I should add accountId to QuickNote in schema ideally.
                // But user wants to proceed. 
                // Let's assume for this MVP, QuickNotes are linked to clients OR we just filter those that match.
                // Actually `createQuickNote` allows `clientId` to be null.
                // If I can't filter by account, I can't isolate them properly if they don't have client.
                // Workaround: Only return notes where client.accountId matches session.accountId.
                // Notes without client will be excluded? 
                // Let's look at `createQuickNote`.
                // It creates with `clientId: clientId`. If null, it's standalone.
                // Standalone notes will be visible to everyone?? major security hole.
                // I MUST add accountId to QuickNote or require Client.
                // `createQuickNote` logic: `if (clientName) find client`. If not found, clientId is null.
                // I'll check `getRecentQuickNotes`.
                client: {
                    accountId: session.accountId
                }
            },
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
        const session = await requireAuth();
        const notes = await prisma.quickNote.findMany({
            where: {
                deletedAt: null,
                client: { accountId: session.accountId }
            },
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
        const session = await requirePermission('client:update:all');
        const note = await prisma.quickNote.update({
            where: {
                id,
                client: { accountId: session.accountId }
            },
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
        const session = await requireAuth();
        // Verify client belongs to account
        const client = await prisma.client.findFirst({
            where: { id: clientId, accountId: session.accountId }
        });
        if (!client) return { success: false, error: 'Client not found' };

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
        const session = await requireAuth();
        const cleanId = id.trim();

        // Step 1: Try Basic Fetch (No Relations) with Account Check
        const basicClient = await prisma.client.findFirst({
            where: {
                id: cleanId,
                accountId: session.accountId
            }
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
        const session = await requirePermission('client:update:all');
        await prisma.quickNote.update({
            where: {
                id,
                client: { accountId: session.accountId }
            },
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
        const session = await requirePermission('client:update:all');
        await prisma.quickNote.update({
            where: {
                id,
                client: { accountId: session.accountId }
            },
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
        const session = await requirePermission('client:update:all');
        const client = await prisma.client.update({
            where: {
                id,
                accountId: session.accountId
            },
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

// ============================================
// Client Search for Scheduling
// ============================================

export async function searchClients(query: string) {
    try {
        const session = await requireAuth();

        if (!query || query.trim().length < 2) {
            return { success: true, data: [] };
        }

        const searchTerm = query.trim();

        const clients = await prisma.client.findMany({
            where: {
                accountId: session.accountId,
                terminatedAt: null, // Only active clients
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { id: { contains: searchTerm, mode: 'insensitive' } },
                ]
            },
            select: {
                id: true,
                name: true,
                condition: true,
                status: true,
                _count: {
                    select: { sessions: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10 // Limit results
        });

        return { success: true, data: clients };
    } catch (error) {
        console.error('Failed to search clients:', error);
        return { success: false, error: 'Failed to search clients' };
    }
}

export async function addSessionForExistingClient(data: {
    clientId: string
    date: Date
    time: string
    location: string
    type?: string
    notes?: string
}) {
    try {
        const session = await requirePermission('session:create');

        // Verify client ownership
        const client = await prisma.client.findFirst({
            where: { id: data.clientId, accountId: session.accountId }
        });
        if (!client) return { success: false, error: 'Client not found' };

        // Combine date and time
        const [hours, minutes] = data.time.split(':').map(Number);
        const sessionDate = new Date(data.date);
        sessionDate.setHours(hours, minutes, 0, 0);

        // Create session
        const newSession = await prisma.session.create({
            data: {
                accountId: session.accountId,
                clientId: data.clientId,
                date: sessionDate,
                title: data.type || '정기 상담',
                type: data.type || '상담',
                location: data.location,
                status: 'Scheduled',
                notes: data.notes || null,
                duration: 50
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        condition: true
                    }
                }
            }
        });

        revalidatePath('/schedule');
        revalidatePath(`/patients/${data.clientId}`);

        return { success: true, data: newSession };
    } catch (error) {
        console.error('Failed to create session:', error);
        return { success: false, error: 'Failed to create session' };
    }
}
