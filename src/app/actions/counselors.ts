'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface CounselorInput {
    name: string;
    nickname?: string;
    birthYear?: string;
    gender?: string;
    qualifications: string[];
    specialties: string[];
    residence?: string;
    phoneNumber?: string;
}

export async function createCounselor(data: CounselorInput) {
    try {
        const counselor = await prisma.counselor.create({
            data
        });
        revalidatePath('/settings');
        return { success: true, data: counselor };
    } catch (error) {
        console.error('Failed to create counselor:', error);
        return { success: false, error: 'Failed to create counselor' };
    }
}

export async function getCounselors() {
    try {
        const counselors = await prisma.counselor.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { clients: true, sessions: true }
                }
            }
        });
        return { success: true, data: counselors };
    } catch (error) {
        console.error('Failed to fetch counselors:', error);
        return { success: false, error: 'Failed to fetch counselors' };
    }
}

export async function updateCounselor(id: string, data: Partial<CounselorInput>) {
    try {
        const counselor = await prisma.counselor.update({
            where: { id },
            data
        });
        revalidatePath('/settings');
        return { success: true, data: counselor };
    } catch (error) {
        console.error('Failed to update counselor:', error);
        return { success: false, error: 'Failed to update counselor' };
    }
}

export async function deleteCounselor(id: string) {
    try {
        await prisma.counselor.delete({
            where: { id }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete counselor:', error);
        return { success: false, error: 'Failed to delete counselor' };
    }
}
