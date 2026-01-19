'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveSetting(key: string, value: string) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to save setting:", error);
        return { success: false, error: "Failed to save setting" };
    }
}

export async function getSetting(key: string) {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return { success: true, data: setting?.value || null };
    } catch (error) {
        console.error("Failed to get setting:", error);
        return { success: false, error: "Failed to get setting" };
    }
}

export async function getSettings(keys: string[]) {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });

        // Convert to object map
        const data: Record<string, string> = {};
        settings.forEach(s => data[s.key] = s.value);

        return { success: true, data };
    } catch (error) {
        console.error("Failed to get settings:", error);
        return { success: false, error: "Failed to get settings" };
    }
}
