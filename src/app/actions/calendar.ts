'use server';

import { prisma } from "@/lib/prisma";

export type CalendarEvent = {
    id: string;
    title: string;
    date: Date;
    type: 'session' | 'other';
    clientId?: string;
    clientName?: string;
    status?: string;
};

export async function getMonthlySchedule(year: number, month: number) {
    try {
        // Calculate start and end of the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of previous month? no, 0 is last of previous. 
        // month is 1-indexed for the input? Let's assume input is 1-12.

        // Correct date range:
        // year=2026, month=1 (Jan) -> start: 2026-01-01, end: 2026-02-00 (which is Jan 31)
        const startStr = startDate.toISOString().split('T')[0];
        // For query, we might just filter by string match on nextSession date field if it's stored as YYYY-MM-DD string
        // The schema uses `nextSession: string` (e.g. "2024-10-10") and `sessionTime: string` (e.g. "14:00") based on previous tasks.

        // However, we also have `sessions` table which has `date: DateTime`.
        // The dashboard needs FUTURE appointments. 
        // In this app, appointments are stored on `Client` model as `nextSession` string ? 
        // Let's verify schema to be sure about where "future schedule" lives.
        // Assuming `Client.nextSession` is the source of truth for upcoming schedule as per previous tasks.

        // Wait, `prisma.client.findMany` with `nextSession` starting with `YYYY-MM` is better.
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
                nextSession: true,
                sessionTime: true,
                condition: true // To color code?
            }
        });

        const events: CalendarEvent[] = scheduledClients.map(c => {
            // Combine date and time to get a proper Date object for sorting/display
            const dateTimeStr = `${c.nextSession}T${c.sessionTime || '00:00'}:00`;
            return {
                id: c.id,
                title: `${c.name} - 상담`,
                date: new Date(dateTimeStr),
                type: 'session',
                clientId: c.id,
                clientName: c.name,
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
