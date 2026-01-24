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
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the last day
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        // Query Session model instead of Client model
        const sessions = await prisma.session.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    notIn: ['Canceled']
                }
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

        const KST_OFFSET = 9 * 60 * 60 * 1000;

        const events: CalendarEvent[] = sessions.map((s: any) => {
            const kstDate = new Date(s.date.getTime() + KST_OFFSET);
            return {
                id: s.id, // Now using Session ID (UUID)
                title: `${s.client.name} - ${s.type}`,
                date: s.date, // Keep original Date object for date-fns in UI (client logic handles timezone conversion naturally)
                type: 'session',
                clientId: s.client.id,
                clientName: s.client.name,
                clientContact: s.client.contact,
                nextSession: kstDate.toISOString().split('T')[0], // derived KST Date
                sessionTime: kstDate.toISOString().split('T')[1].substring(0, 5), // derived KST Time
                sessionType: s.type || 'session', // Map 'type' to 'sessionType'
                location: s.client?.location || s.location || 'Center', // Use available location
                status: (s.status || 'Scheduled').toLowerCase()
            };
        });

        // but maybe fetch `Session` table for past logs if needed later. 
        // For now, let's just return scheduled items.

        return { success: true, data: events };

    } catch (error: any) {
        console.error("Failed to fetch monthly schedule:", error);
        return {
            success: false,
            error: `Fetch Error: ${error?.message || String(error)}`
        };
    }
}
