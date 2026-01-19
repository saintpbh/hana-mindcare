'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function ensureSpecializedLocations() {
    const specializedLocations = ['Zoom (화상)', 'Phone (전화)'];

    for (const loc of specializedLocations) {
        const exists = await prisma.location.findUnique({ where: { name: loc } });
        if (!exists) {
            try {
                await prisma.location.create({ data: { name: loc } });
                console.log(`Created location: ${loc}`);
            } catch (e) {
                console.error(`Failed to create ${loc}`, e);
            }
        }
    }
}

export async function getLocations() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: locations };
    } catch (error) {
        console.error('Failed to get locations:', error);
        return { success: false, error: 'Failed to get locations' };
    }
}

export async function addLocation(name: string) {
    try {
        const location = await prisma.location.create({
            data: { name }
        });
        revalidatePath('/settings');
        return { success: true, data: location };
    } catch (error) {
        console.error('Failed to add location:', error);
        return { success: false, error: 'Failed to add location' };
    }
}

export async function deleteLocation(id: string) {
    try {
        await prisma.location.delete({
            where: { id }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete location:', error);
        return { success: false, error: 'Failed to delete location' };
    }
}
