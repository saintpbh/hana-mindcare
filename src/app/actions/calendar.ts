'use server';

import { prisma } from "@/lib/prisma";

export type CalendarEvent = {
    id: string;
    title: string;
    date: Date;
    type: 'session' | 'other';
    clientId?: string;
    clientName?: string;
    clientContact?: string;
    nextSession?: string;
    sessionTime?: string;
    location?: string;
    sessionType?: string;
    status?: string;
};

export async function getMonthlySchedule(year: number, month: number) {
    try {
        // Calculate start and end of the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        const scheduledClients = await prisma.client.findMany({
            where: {
                nextSession: {
                    startsWith: monthStr
                },
                isSessionCanceled: false
            },
            select: {
                id: true,
                name: true,
                contact: true,
                nextSession: true,
                sessionTime: true,
                sessionType: true,
                location: true,
                condition: true
            }
        });

        const events: CalendarEvent[] = scheduledClients.map((c: any) => {
            // Combine date and time to get a proper Date object for sorting/display
            const dateTimeStr = `${c.nextSession}T${c.sessionTime || '00:00'}:00`;
            return {
                id: c.id,
                title: `${c.name} - 상담`,
                date: new Date(dateTimeStr),
                type: 'session',
                clientId: c.id,
                clientName: c.name,
                clientContact: c.contact,
                nextSession: c.nextSession,
                sessionTime: c.sessionTime,
                sessionType: c.sessionType,
                location: c.location,
                status: 'scheduled'
            };
        });

        // Check past sessions too if we want a full calendar history?
        // User asked for "Schedule Management", implies future planning.
        // Looking at the screenshot, it shows past history too.
        // Let's stick to future scheduled items for now to keep it focused on "Management", 
        // but maybe fetch `Session` table for past logs if needed later. 
        // For now, let's just return scheduled items.

        return { success: true, data: events };

    } catch (error) {
        console.error("Failed to fetch monthly schedule:", error);
        return { success: false, error: 'Failed to fetch schedule' };
    }
}
