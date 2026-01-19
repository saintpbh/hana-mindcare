'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveMood(clientId: string, score: number, note?: string) {
    try {
        const mood = await prisma.mood.create({
            data: {
                clientId,
                score,
                note
            }
        });
        revalidatePath(`/patients/${clientId}`);
        return { success: true, data: mood };
    } catch (error) {
        console.error("Failed to save mood:", error);
        return { success: false, error: "Failed to save mood" };
    }
}

export async function getClientMoods(clientId: string) {
    try {
        const moods = await prisma.mood.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            take: 365 // Last year
        });
        return { success: true, data: moods };
    } catch (error) {
        console.error("Failed to fetch moods:", error);
        return { success: false, error: "Failed to fetch moods" };
    }
}
