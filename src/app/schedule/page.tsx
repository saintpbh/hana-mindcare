"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntakeWizard } from "@/components/schedule/IntakeWizard";
import { CalendarView } from "@/components/schedule/CalendarView";
import { EditAppointmentModal } from "@/components/schedule/EditAppointmentModal";
import { ScheduleDetailPanel } from "@/components/schedule/ScheduleDetailPanel";
import { SessionListPanel } from "@/components/schedule/SessionListPanel";
import { DayViewSidebar } from "@/components/schedule/DayViewSidebar";

import { getClients } from "@/app/actions/clients";
type Client = any;
import { useEffect } from "react";

export default function SchedulePage() {
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week");
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // Default to Today (System Time)

    // Smart Selection Logic: explicit select -> current time (mocked for demo) -> next upcoming
    const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

    // Fallback logic for demo purposes
    const defaultAppointment = !selectedAppointmentId
        ? appointments.find(a => a.time >= 10 && a.day === 0)
        : null;

    // Helper to format header date
    const formatHeaderDate = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();

        if (currentView === "day") return `${year}년 ${month}월 ${date}일`;
        if (currentView === "week") {
            // Calculate week range
            const day = currentDate.getDay(); // 0=Sun
            const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
            const monday = new Date(currentDate);
            monday.setDate(diff);
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            return `${year}년 ${month}월 ${monday.getDate()}일 - ${friday.getDate()}일`;
        }
        return `${year}년 ${month}월`;
    };

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (currentView === "month") newDate.setMonth(newDate.getMonth() - 1);
        if (currentView === "week") newDate.setDate(newDate.getDate() - 7);
        if (currentView === "day") newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (currentView === "month") newDate.setMonth(newDate.getMonth() + 1);
        if (currentView === "week") newDate.setDate(newDate.getDate() + 7);
        if (currentView === "day") newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            const result = await getClients();
            if (result.success && result.data) {
                const mappedAppointments = result.data.map((client: Client) => {
                    // Start time parsing
                    const timeStr = client.sessionTime || "10:00";
                    const hour = parseInt(timeStr.split(':')[0], 10);

                    // Date parsing
                    const sessionDate = new Date(client.nextSession);
                    const day = sessionDate.getDay() - 1; // 0=Sun, 1=Mon... we want 0=Mon.

                    let color = "bg-teal-100 text-teal-900 border-teal-200"; // Stable/Ongoing
                    if (client.status === 'crisis') color = "bg-rose-100 text-rose-900 border-rose-200";
                    if (client.tags.includes('intake')) color = "bg-amber-100 text-amber-900 border-amber-200";

                    return {
                        id: client.id,
                        title: client.name,
                        type: client.tags.includes('intake') ? "Intake" : (client.status === 'crisis' ? "Crisis" : "Ongoing"),
                        time: hour,
                        day: day < 0 ? 6 : day, // Handle Sunday
                        duration: 1,
                        color,
                        location: client.location,
                        rawDate: sessionDate.toISOString().split('T')[0], // Ensure YYYY-MM-DD format
                        history: client.sessions ? client.sessions.map((s: any) => ({
                            id: s.id,
                            date: new Date(s.date),
                            duration: s.duration,
                            summary: s.notes, // Assuming 'notes' field for summary
                            type: 'Counseling'
                        })) : []
                    };
                });
                setAppointments(mappedAppointments);
            }
            setIsLoading(false);
        };
        fetchAppointments();
    }, []);

    const handleAddAppointment = (newApt: any) => {
        setAppointments([...appointments, { ...newApt, id: Date.now() }]);
        // In reality, this should call createClient
    };

    const handleUpdateAppointment = (updated: any) => {
        setAppointments(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
        // In reality, this should call updateClient
    };

    const handleDeleteAppointment = (id: number) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
    }

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-hidden flex flex-col h-screen">

            {/* Header */}
            <header className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                            일정 및 접수 관리
                        </h1>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">
                            상담 일정을 관리하고 신규 내담자를 등록합니다.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Switcher */}
                    <div className="flex bg-white rounded-lg border border-[var(--color-midnight-navy)]/10 p-1 shadow-sm">
                        {[
                            { id: "day", label: "일간" },
                            { id: "week", label: "주간" },
                            { id: "month", label: "월간" }
                        ].map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setCurrentView(v.id as any)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                                    currentView === v.id
                                        ? "bg-[var(--color-midnight-navy)] text-white shadow-md shadow-[var(--color-midnight-navy)]/20"
                                        : "text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/5"
                                )}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center bg-white rounded-lg border border-[var(--color-midnight-navy)]/10 p-1 shadow-sm">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium text-[var(--color-midnight-navy)] min-w-[140px] text-center">
                            {formatHeaderDate()}
                        </span>
                        <button onClick={handleNext} className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsIntakeOpen(true)}
                        className="h-10 px-5 rounded-full bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20"
                    >
                        <Plus className="w-4 h-4" />
                        신규 내담자 접수 (Intake)
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex gap-6 flex-1 min-h-0">
                {/* 1. Sidebar (Day View Only) */}
                {currentView === "day" && (
                    <DayViewSidebar
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        appointments={appointments}
                        sessions={appointments.filter(a => a.rawDate === currentDate.toISOString().split('T')[0])}
                    />
                )}

                {/* 2. Main Calendar Area (Left, Flexible) */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <CalendarView
                        appointments={appointments}
                        setAppointments={setAppointments}
                        onEditAppointment={(id) => setEditingAppointment(appointments.find(a => a.id === id))}
                        view={currentView}
                        currentDate={currentDate}
                        onDateChange={(date) => {
                            setCurrentDate(date);
                        }}
                        onSelectAppointment={(id) => setSelectedAppointmentId(id)}
                        selectedAppointmentId={selectedAppointmentId}
                    />
                </div>

                {/* 3. Client Detail Panel (Center, Fixed Width) */}
                {selectedAppointment ? (
                    <aside className="w-[400px] shrink-0 h-full border-l border-[var(--color-midnight-navy)]/5 bg-white shadow-sm z-10 transition-all">
                        <ScheduleDetailPanel
                            appointment={selectedAppointment}
                            onClose={() => setSelectedAppointmentId(null)}
                            onEdit={(id) => setEditingAppointment(appointments.find(a => a.id === id))}
                        />
                    </aside>
                ) : (
                    <aside className="w-[400px] shrink-0 h-full border-l border-[var(--color-midnight-navy)]/5 bg-white/50 flex flex-col items-center justify-center text-[var(--color-midnight-navy)]/30 gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center">
                            <Plus className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium">일정을 선택하여 상세 정보를 확인하세요</p>
                    </aside>
                )}

                {/* 4. Session History Panel (Right, Fixed Width) */}
                <aside className="w-[320px] shrink-0 h-full border-l border-[var(--color-midnight-navy)]/5 bg-gray-50/50">
                    <SessionListPanel
                        sessions={selectedAppointment?.history || []}
                        clientName={selectedAppointment?.title}
                    />
                </aside>
            </div>

            <IntakeWizard
                isOpen={isIntakeOpen}
                onClose={() => setIsIntakeOpen(false)}
                onComplete={handleAddAppointment}
                existingAppointments={appointments}
            />

            <EditAppointmentModal
                isOpen={!!editingAppointment}
                onClose={() => setEditingAppointment(null)}
                onSave={handleUpdateAppointment}
                onDelete={handleDeleteAppointment}
                appointment={editingAppointment}
            />
        </div>
    );
}
