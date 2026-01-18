'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSessionDetails(sessionId: string) {
    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                client: true,
                counselingLog: true
            }
        });

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to fetch session details:', error);
        return { success: false, error: 'Failed to fetch session details' };
    }
}

export async function updateTranscript(sessionId: string, transcript: string) {
    try {
        const session = await prisma.session.update({
            where: { id: sessionId },
            data: { transcript }
        });
        revalidatePath(`/patients/${session.clientId}/sessions/${sessionId}`);
        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to update transcript:', error);
        return { success: false, error: 'Failed to update transcript' };
    }
}

export interface CounselingLogData {
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
    status?: string | null;
    writerName?: string | null;
}

export async function upsertCounselingLog(sessionId: string, data: CounselingLogData) {
    try {
        // Check if log exists
        const existingLog = await prisma.counselingLog.findUnique({
            where: { sessionId }
        });

        // Sanitize data: Prisma doesn't like null for non-nullable fields or optional updates
        // We convert null to undefined to let Prisma ignore it or use defaults
        const cleanData = {
            subjective: data.subjective ?? undefined,
            objective: data.objective ?? undefined,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            status: data.status ?? undefined, // status is required String in DB but has default
            writerName: data.writerName ?? undefined,
        };

        let log;
        if (existingLog) {
            log = await prisma.counselingLog.update({
                where: { sessionId },
                data: {
                    ...cleanData,
                    signedAt: cleanData.status === 'FINAL' ? new Date() : undefined
                }
            });
        } else {
            log = await prisma.counselingLog.create({
                data: {
                    sessionId,
                    ...cleanData,
                    signedAt: cleanData.status === 'FINAL' ? new Date() : undefined
                }
            });
        }

        // We need to fetch session to get clientId for revalidation
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (session) {
            revalidatePath(`/patients/${session.clientId}/sessions/${sessionId}`);
        }

        return { success: true, data: log };
    } catch (error) {
        console.error('Failed to save counseling log:', error);
        return { success: false, error: 'Failed to save counseling log' };
    }
}

export async function getCounselingLogs() {
    try {
        const logs = await prisma.counselingLog.findMany({
            include: {
                session: {
                    include: {
                        client: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return { success: false, error: 'Failed to fetch logs' };
    }
}

export async function createSession(data: {
    clientId: string;
    title: string;
    summary: string;
    sentiment: string;
    keywords: string[];
    transcript: string;
    notes: string;
    date: Date;
}) {
    try {
        const session = await prisma.session.create({
            data: {
                clientId: data.clientId,
                title: data.title,
                summary: data.summary,
                sentiment: data.sentiment,
                keywords: data.keywords,
                transcript: data.transcript,
                notes: data.notes,
                date: data.date,
            }
        });

        revalidatePath(`/patients/${data.clientId}`);
        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to create session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: `Failed to create session: ${errorMessage}` };
    }
}

export async function updateSessionNotes(sessionId: string, notes: string) {
    try {
        const session = await prisma.session.update({
            where: { id: sessionId },
            data: { notes }
        });
        revalidatePath(`/patients/${session.clientId}/sessions/${sessionId}`);
        return { success: true, data: session };
    } catch (error) {
        console.error('Failed to update session notes:', error);
        return { success: false, error: 'Failed to update session notes' };
    }
}
