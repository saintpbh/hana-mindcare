'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function togglePortalAccess(clientId: string, isPortalActive: boolean) {
    try {
        const client = await prisma.client.update({
            where: { id: clientId },
            data: { isPortalActive }
        });
        revalidatePath(`/patients/${clientId}`);
        return { success: true, data: client };
    } catch (error) {
        console.error("Failed to toggle portal access:", error);
        return { success: false, error: "Failed to update portal status" };
    }
}

export async function refreshPortalToken(clientId: string) {
    try {
        const newToken = uuidv4();
        const client = await prisma.client.update({
            where: { id: clientId },
            data: { portalToken: newToken }
        });
        revalidatePath(`/patients/${clientId}`);
        return { success: true, data: client };
    } catch (error) {
        console.error("Failed to refresh portal token:", error);
        return { success: false, error: "Failed to generate new secure link" };
    }
}

export async function updateLastPortalAccess(portalToken: string) {
    try {
        // Find by portalToken first
        const client = await (prisma.client as any).update({
            where: { portalToken },
            data: { lastPortalAccessAt: new Date() }
        });
        return { success: true, data: client };
    } catch (error) {
        console.error("Failed to update last access (possibly stale Prisma cache):", error);
        // Silent fail for tracking to avoid crashing the user experience
        return { success: false, error: "Internal tracking error" };
    }
}
