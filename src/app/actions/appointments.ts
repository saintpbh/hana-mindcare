'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Map Session to UI Appointment
function mapSessionToAppointment(session: any) {
    return {
        id: session.id, // String in DB
        title: session.title,
        time: session.date.toISOString().split('T')[1].substring(0, 5), // HH:MM
        duration: session.duration / 60, // Convert minutes to hours for CalendarView
        type: session.type, // '상담', '검사'
        rawDate: session.date.toISOString().split('T')[0],
        client: session.client.name,
        clientId: session.clientId,
        status: session.status as any,
        recurring: session.recurring as any,
        notes: session.notes || session.summary || "", // Use notes or summary
    }
}

export async function getAppointments(startDate: Date, endDate: Date) {
    try {
        const sessions = await prisma.session.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                client: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        return { success: true, data: sessions.map(mapSessionToAppointment) };
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return { success: false, error: "Failed to fetch appointments" };
    }
}

export async function getNextSession() {
    try {
        const now = new Date();
        const nextSession = await prisma.session.findFirst({
            where: {
                date: { gte: now },
                status: 'Scheduled'
            },
            include: {
                client: true
            },
            orderBy: { date: 'asc' }
        });

        if (!nextSession) return { success: true, data: null };

        return {
            success: true,
            data: {
                id: nextSession.id,
                clientName: nextSession.client.name,
                condition: nextSession.client.condition || "General",
                time: nextSession.date.toISOString(), // Full ISO string for calculation
                duration: nextSession.duration,
                type: nextSession.type,
                sessionNumber: 4, // Mock for now, or calc
                totalSessions: 12, // Mock for now, or calc
                keySignal: "Check Sleep Patterns", // Mock or from last note
                signalDetail: "Client reported insomnia in last survey (PSQI Score: 14)." // Mock
            }
        };
    } catch (error) {
        console.error("Failed to fetch next session:", error);
        return { success: false, error: "Failed to fetch next session" };
    }
}

export async function createAppointment(data: {
    clientId: string,
    date: string, // YYYY-MM-DD
    time: string, // HH:MM
    type: string,
    duration: number,
    notes?: string,
    recurring?: string
}) {
    try {
        const dateTime = new Date(`${data.date}T${data.time}:00`);

        const session = await prisma.session.create({
            data: {
                clientId: data.clientId,
                date: dateTime,
                title: `${data.type} (예약)`, // Default title
                type: data.type,
                duration: data.duration,
                status: 'Scheduled',
                recurring: data.recurring || 'None',
                summary: data.notes || "", // Map notes to summary/notes?
                notes: data.notes,
                sentiment: 'Neutral', // Default
            }
        });

        revalidatePath('/schedule');
        return { success: true, data: session };
    } catch (error) {
        console.error("Failed to create appointment:", error);
        return { success: false, error: "Failed to create appointment" };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.session.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/schedule');
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
