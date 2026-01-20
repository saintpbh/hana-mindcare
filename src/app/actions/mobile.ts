'use server'

import { prisma } from '@/lib/prisma'

export async function getClientVideoStatus(clientId: string) {
    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: {
                id: true,
                name: true,
                isVideoEnabled: true,
                isPortalActive: true
            } as any
        });

        return { success: true, data: client };
    } catch (error) {
        console.error('Failed to fetch client video status:', error);
        return { success: false, error: 'Failed to fetch status' };
    }
}
