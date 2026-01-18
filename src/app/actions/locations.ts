'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLocations() {
    try {
        let locations = await prisma.location.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Seed initial locations if empty
        if (locations.length === 0) {
            const initialLocs = ["선릉 센터", "양재 센터", "논현 센터"];
            await prisma.location.createMany({
                data: initialLocs.map(name => ({ name }))
            });
            locations = await prisma.location.findMany({
                orderBy: {
                    createdAt: 'asc'
                }
            });
        }

        return { success: true, data: locations };
    } catch (error: any) {
        console.error("Failed to fetch locations:", error);
        return { success: false, error: 'Failed to fetch locations: ' + (error.message || 'Unknown error') };
    }
}

export async function addLocation(name: string) {
    try {
        const location = await prisma.location.create({
            data: { name }
        });
        revalidatePath('/settings');
        revalidatePath('/patients/[id]', 'page');
        return { success: true, data: location };
    } catch (error: any) {
        console.error("Failed to add location:", error);
        return { success: false, error: 'Failed to add location: ' + (error.message || 'Unknown error') };
    }
}

export async function deleteLocation(id: string) {
    try {
        await prisma.location.delete({
            where: { id }
        });
        revalidatePath('/settings');
        revalidatePath('/patients/[id]', 'page');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete location:", error);
        return { success: false, error: 'Failed to delete location' };
    }
}
