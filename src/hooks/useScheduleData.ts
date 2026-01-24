import { useState, useEffect, useCallback } from "react";
import { getAppointments } from "@/app/actions/appointments";

export interface ScheduleAppointment {
    id: number;
    title: string;
    clientId: string;
    type: string;
    time: number; // Float hour (e.g., 14.5 for 14:30)
    day: number; // 0-6 (Sun-Sat)
    duration: number;
    color: string;
    location?: string;
    meetingLink?: string;
    rawDate: string; // YYYY-MM-DD
    notes?: string;
    status: string;
    history: any[];
}

export function useScheduleData(currentDate: Date, currentView: "day" | "week" | "month") {
    const [appointments, setAppointments] = useState<ScheduleAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Calculate range based on view? 
        // Current logic in page.tsx gets a broad range (Month +/- 7 days) to support transitions
        // We can keep that logic for simplicity and caching benefit
        const startDate = new Date(year, month, 1);
        startDate.setDate(startDate.getDate() - 7);

        const endDate = new Date(year, month + 1, 0);
        endDate.setDate(endDate.getDate() + 7);

        try {
            const result = await getAppointments(startDate, endDate);

            if (result.success && result.data) {
                const mappedAppointments = result.data.map((session: any) => {
                    // 1. Parse Date (UTC ISO -> Local Date Object)
                    const sessionDate = new Date(session.date);

                    // 2. Calculate Positioning Data
                    // Float hour for Grid (e.g., 14:30 -> 14.5)
                    const hour = sessionDate.getHours() + (sessionDate.getMinutes() / 60);

                    // day index (0=Sun, 1=Mon...)
                    const day = sessionDate.getDay();

                    // 3. Format Local Date String (YYYY-MM-DD)
                    // Important: Do NOT use toISOString() as it converts back to UTC.
                    // Use local components.
                    const y = sessionDate.getFullYear();
                    const m = String(sessionDate.getMonth() + 1).padStart(2, '0');
                    const d = String(sessionDate.getDate()).padStart(2, '0');
                    const rawDate = `${y}-${m}-${d}`;

                    // 4. Determine Styling
                    let color = "bg-teal-100 text-teal-900 border-teal-200"; // Stable/Ongoing
                    if (session.status === 'Canceled') color = "bg-gray-100 text-gray-900 border-gray-200 opacity-50";
                    if (session.type === 'intake' || session.title.includes('Intake') || session.title.includes('초기')) color = "bg-amber-100 text-amber-900 border-amber-200";

                    return {
                        id: session.id,
                        title: session.client,
                        clientId: session.clientId,
                        type: session.type,
                        time: hour,
                        day: day,
                        duration: session.duration || 1,
                        color,
                        location: session.location,
                        meetingLink: session.meetingLink,
                        rawDate: rawDate,
                        notes: session.notes,
                        status: session.status,
                        history: []
                    };
                });
                setAppointments(mappedAppointments);
            }
        } catch (error) {
            console.error("Failed to fetch schedule data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentDate]); // Dependency on currentDate (view change might not need refetch if range is wide enough, but current logic fetches on view change too in page.tsx. Let's optimize: checking if date is consistent? page logic had [currentDate, currentView]. Let's stick to that for safety.)
    // Actually, fetching on every view change might be redundant if the date is same, but `currentDate` often changes when switching views (e.g. jumping to today). 
    // Let's rely on currentDate. The range covers the whole month.

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return {
        appointments,
        setAppointments,
        isLoading,
        refresh: fetchAppointments
    };
}
