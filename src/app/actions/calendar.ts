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

        // Query Session model instead of Client model
        const sessions = await prisma.session.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                // Optionally filter out canceled if needed, or include them with status
                // status: { not: 'Canceled' } // Let's include everything and handle in UI
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        contact: true,
                        location: true // Fallback location if not in session
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        const events: CalendarEvent[] = sessions.map((s: any) => {
            return {
                id: s.id, // Now using Session ID (UUID)
                title: `${s.client.name} - ${s.type}`,
                date: s.date,
                type: 'session',
                clientId: s.client.id,
                clientName: s.client.name,
                clientContact: s.client.contact,
                nextSession: s.date.toISOString().split('T')[0], // derived
                sessionTime: s.date.toISOString().split('T')[1].substring(0, 5), // HH:MM
                sessionType: s.type, // Map 'type' to 'sessionType'
                location: s.client.location, // Use client's default location for now
                status: s.status.toLowerCase()
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
