'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'

// Map Session to UI Appointment
function mapSessionToAppointment(session: any) {
    return {
        id: session.id, // String in DB
        title: session.title,
        date: session.date.toISOString(), // Full UTC String for client parsing
        duration: session.duration / 60, // Convert minutes to hours for CalendarView
        type: session.type, // '상담', '검사'
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
        const session = await requireAuth();
        const sessions = await prisma.session.findMany({
            where: {
                accountId: session.accountId,
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
    const session = await requireAuth();

    try {
        const nextSession = await prisma.session.findFirst({
            where: {
                accountId: session.accountId,
                status: 'Scheduled',
                date: { gte: new Date() }
            },
            orderBy: { date: 'asc' },
            include: {
                client: true
            }
        });

        if (!nextSession) {
            return { success: false, error: "No upcoming session found" };
        }

        // Calculate real session number (count of completed + scheduled sessions)
        const sessionCount = await prisma.session.count({
            where: {
                clientId: nextSession.clientId,
                status: { in: ['Completed', 'Scheduled'] }
            }
        });

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
                sessionNumber: sessionCount,
                totalSessions: nextSession.client.totalSessions || null,
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

        const session = await requireAuth();

        // Verify client belongs to account
        const client = await prisma.client.findFirst({
            where: { id: data.clientId, accountId: session.accountId }
        });
        if (!client) {
            return { success: false, error: "Client not found" };
        }

        const newSession = await prisma.session.create({
            data: {
                clientId: data.clientId,
                accountId: session.accountId,
                counselorId: data.counselorId || undefined, // Convert empty string to undefined
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

        // Update Client nextSession denormalized fields
        await prisma.client.update({
            where: { id: data.clientId },
            data: {
                nextSession: data.date,
                sessionTime: data.time
            }
        });

        revalidatePath('/schedule');
        revalidatePath('/');
        return { success: true, data: newSession };
    } catch (error) {
        console.error("Failed to create appointment:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create appointment" };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        // Check auth for update? Usually good practice, though maybe not strictly required if ID is UUID.
        // But let's add it for consistency if we can. 
        // Note: updateAppointmentStatus only takes ID. We should probably verify ownership.
        const session = await requireAuth();
        await prisma.session.update({
            where: {
                id,
                accountId: session.accountId
            },
            data: { status }
        });
        revalidatePath('/schedule');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function updateAppointmentTime(id: string, newDate: Date, duration?: number, dateString?: string, timeString?: string) {
    try {
        const session = await requireAuth();

        // Prepare update data
        const updateData: any = {
            date: newDate
        };
        if (duration) {
            updateData.duration = duration * 60; // Store as minutes (DB limit), UI sends hours
        }

        const updatedSession = await prisma.session.update({
            where: {
                id,
                accountId: session.accountId
            },
            data: updateData
        });

        // Update Client if dateString/timeString provided
        if (dateString && timeString) {
            await prisma.client.update({
                where: { id: updatedSession.clientId },
                data: {
                    nextSession: dateString,
                    sessionTime: timeString
                }
            });
        }

        revalidatePath('/schedule');
        revalidatePath('/');
        return { success: true, data: updatedSession };
    } catch (error) {
        console.error("Failed to update appointment time:", error);
        return { success: false, error: "Failed to update appointment time" };
    }
}

export async function checkAvailability(date: string, counselorId?: string) {
    try {
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const session = await requireAuth();
        const bookedSessions = await prisma.session.findMany({
            where: {
                accountId: session.accountId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'Canceled' },
                ...(counselorId ? { counselorId } : {})
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
        const session = await requireAuth();

        // 1. Create Client
        const client = await prisma.client.create({
            data: {
                accountId: session.accountId,
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
                accountId: session.accountId,
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

