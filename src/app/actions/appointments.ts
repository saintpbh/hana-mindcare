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
        meetingLink: session.meetingLink,
        location: session.location,
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
                clientId: nextSession.clientId,
                clientName: nextSession.client.name,
                condition: nextSession.client.condition || "General",
                time: nextSession.date.toISOString(), // Full ISO string for calculation
                duration: nextSession.duration,
                type: nextSession.type,
                location: nextSession.location,
                meetingLink: nextSession.meetingLink,
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

import { generateMeetingLink } from '@/lib/meeting';

export async function createAppointment(data: {
    clientId: string,
    date: string, // YYYY-MM-DD
    time: string, // HH:MM
    type: string,
    duration: number,
    notes?: string,
    recurring?: string,
    counselorId?: string, // Added
    location?: string     // Added
}) {
    try {
        const dateTime = new Date(`${data.date}T${data.time}:00`);
        let meetingLink = null;

        // Auto-create meeting link if type implies video/remote
        if (data.type === 'online' || data.type === 'video' || data.type?.includes('비대면') || data.type?.includes('Video') || data.type?.includes('Zoom') || data.location === 'Zoom (화상)' || data.location?.includes('비대면')) {
            meetingLink = await generateMeetingLink(
                `${data.type} - 상담 예약`,
                dateTime,
                data.duration
            );
        }

        const session = await prisma.session.create({
            data: {
                clientId: data.clientId,
                counselorId: data.counselorId,
                date: dateTime,
                title: `${data.type} (예약)`, // Default title
                type: data.type,
                duration: data.duration,
                status: 'Scheduled',
                recurring: data.recurring || 'None',
                summary: data.notes || "", // Map notes to summary/notes?
                notes: data.notes,
                sentiment: 'Neutral', // Default
                meetingLink: meetingLink,
                location: data.location
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

export async function checkAvailability(date: string) {
    try {
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const bookedSessions = await prisma.session.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'Canceled' }
            },
            include: {
                client: { select: { name: true } }
            }
        });

        // Map to { time: "HH:MM", name: "Client Name" }
        const busySlots = bookedSessions.map((s: any) => ({
            time: s.date.toISOString().split('T')[1].substring(0, 5),
            name: s.client.name
        }));

        return { success: true, data: busySlots };
    } catch (error) {
        console.error("Failed to check availability:", error);
        return { success: false, error: "Failed to check availability" };
    }
}

export async function processIntake(data: {
    name: string,
    phone: string,
    email: string,
    concern: string,
    notes: string,
    selectedDay: string,
    selectedTime: number,
    location: string,
    duration: number
}) {
    try {
        // 1. Create Client
        const client = await prisma.client.create({
            data: {
                name: data.name,
                contact: data.phone,
                notes: data.notes,
                condition: data.concern,
                status: 'stable',
                age: 30, // Default placeholder
                gender: 'M', // Default placeholder
                lastSession: 'None',
                nextSession: '', // Will update
                sessionTime: `${data.selectedTime.toString().padStart(2, '0')}:00`,
                tags: ['intake'],
            }
        });

        // 2. Calculate Date (Target day in the CURRENT week)
        const dayMap: Record<string, number> = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 0 };
        const targetDay = dayMap[data.selectedDay] || 1;

        const now = new Date();
        const currentDay = now.getDay();
        const diff = targetDay - currentDay;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);
        targetDate.setHours(data.selectedTime, 0, 0, 0);

        // 3. Create Session
        await prisma.session.create({
            data: {
                clientId: client.id,
                date: targetDate,
                title: '초기 면담 (Intake)',
                type: '상담',
                duration: data.duration * 60, // Convert hours to minutes
                status: 'Scheduled',
                location: data.location,
                notes: data.notes
            }
        });

        // 4. Update Client nextSession info
        await prisma.client.update({
            where: { id: client.id },
            data: {
                nextSession: targetDate.toISOString().split('T')[0]
            }
        });

        revalidatePath('/schedule');
        revalidatePath('/');
        return { success: true, data: client };
    } catch (error) {
        console.error("Failed to process intake:", error);
        return { success: false, error: "Failed to process intake" };
    }
}
