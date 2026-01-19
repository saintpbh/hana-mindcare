"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntakeWizard } from "@/components/schedule/IntakeWizard";
import { CalendarView, type Appointment } from "@/components/schedule/CalendarView";
import { EditAppointmentModal } from "@/components/schedule/EditAppointmentModal";
import { ScheduleDetailPanel } from "@/components/schedule/ScheduleDetailPanel";
import { SessionListPanel } from "@/components/schedule/SessionListPanel";
import { DayViewSidebar } from "@/components/schedule/DayViewSidebar";

import { getClients } from "@/app/actions/clients";
import { getAppointments } from "@/app/actions/appointments";
import { ScheduleModal } from "@/components/patients/ScheduleModal";
import { AnimatePresence, motion } from "framer-motion";

type Client = any; // TODO: Use Prisma Client type

export default function SchedulePage() {
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]); // Store raw clients for modal
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week");
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | number | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // Default to Today (System Time)

    // Reschedule State
    const [rescheduleTarget, setRescheduleTarget] = useState<{ client: Client, newDate: Date } | null>(null);

    // Smart Selection Logic
    const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

    const formatHeaderDate = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();

        if (currentView === "day") return `${year}년 ${month}월 ${date}일`;
        if (currentView === "week") {
            const day = currentDate.getDay();
            const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
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
        const fetchAppointmentsData = async () => {
            setIsLoading(true);
            // Calculate range based on view/date (simplified: fetch +/- 1 month for now)
            const startWindow = new Date(currentDate);
            startWindow.setMonth(startWindow.getMonth() - 1);
            const endWindow = new Date(currentDate);
            endWindow.setMonth(endWindow.getMonth() + 1);

            const result = await getAppointments(startWindow, endWindow);
            if (result.success && result.data) {
                // Ensure IDs match Appointment interface (string | number)
                setAppointments(result.data.map((apt: any) => ({
                    ...apt,
                    color: apt.status === 'Scheduled' ? "bg-teal-100 text-teal-900 border-teal-200" : undefined,
                    id: apt.id
                })));
            }

            // Also fetch clients for modal
            const clientsRes = await getClients();
            if (clientsRes.success) setClients(clientsRes.data || []);

            setIsLoading(false);
        };
        fetchAppointmentsData();
    }, [currentDate]);

    const handleAddAppointment = async (newApt: any) => {
        // Logic should move to Modal onSuccess
        // Refresh list
        // For now, just re-fetch or rely on useEffect
    };

    const handleUpdateAppointment = (updated: any) => {
        // Logic should move to Modal onSuccess
    };

    const handleDeleteAppointment = (id: string | number) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
    };

    // Smart Reschedule Handler
    const handleReschedule = (id: string | number, newDate: Date) => {
        console.log(`Rescheduling appointment ${id} to ${newDate.toISOString()}`);
        const client = clients.find(c => c.id === id); // NOTE: id might be appointmentId or clientId? 
        // CalendarView passes appointment ID. We need appointment's client.
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
            const client = clients.find(c => c.name === appointment.client); // Weak link by name, ideally clientId
            // Better: appointment should have clientId
            if (client) {
                setRescheduleTarget({ client, newDate });
            } else {
                console.error("Client not found for rescheduling");
                // Fallback or fetch client
            }
        }
    };

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
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">
                {/* 1. Sidebar (Day View Only) - Hidden on Mobile unless tailored */}
                {currentView === "day" && (
                    <div className="hidden lg:block">
                        <DayViewSidebar
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            appointments={appointments}
                            sessions={appointments.filter(a => a.rawDate === currentDate.toISOString().split('T')[0])}
                        />
                    </div>
                )}

                {/* 2. Main Calendar Area (Flexible) */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    <CalendarView
                        appointments={appointments}
                        setAppointments={setAppointments}
                        onEditAppointment={(id) => setEditingAppointment(appointments.find(a => a.id === id) || null)}
                        view={currentView}
                        currentDate={currentDate}
                        onDateChange={(date) => {
                            setCurrentDate(date);
                        }}
                        onSelectAppointment={(id) => setSelectedAppointmentId(id)}
                        selectedAppointmentId={selectedAppointmentId}
                        onReschedule={handleReschedule}
                    />
                </div>

                {/* 3. Client Detail Panel (Right, Fixed Width on Desktop, Overlay on Mobile) */}
                <AnimatePresence>
                    {selectedAppointment && (
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute lg:relative inset-0 lg:inset-auto z-20 w-full lg:w-[400px] shrink-0 h-full border-l border-[var(--color-midnight-navy)]/5 bg-white shadow-xl lg:shadow-sm"
                        >
                            <div className="h-full flex flex-col">
                                <div className="lg:hidden p-4 bg-gray-50 border-b flex justify-start">
                                    <button onClick={() => setSelectedAppointmentId(null)} className="flex items-center text-sm font-bold text-gray-500">
                                        <ChevronRight className="w-5 h-5" /> 돌아가기
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <ScheduleDetailPanel
                                        appointment={selectedAppointment}
                                        onClose={() => setSelectedAppointmentId(null)}
                                        onEdit={(id) => setEditingAppointment(appointments.find(a => a.id === id) || null)}
                                    />
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* 4. Session History Panel (Hidden on Mobile for simplicity or merged into Detail) */}
                <aside className="hidden xl:block w-[320px] shrink-0 h-full border-l border-[var(--color-midnight-navy)]/5 bg-gray-50/50">
                    <SessionListPanel
                        sessions={(selectedAppointment as any)?.history || []}
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

            {/* Smart Reschedule Modal */}
            {rescheduleTarget && (
                <ScheduleModal
                    isOpen={true}
                    onClose={() => setRescheduleTarget(null)}
                    selectedClient={rescheduleTarget.client}
                    rescheduleMode={true}
                    initialDate={rescheduleTarget.newDate}
                />
            )}
        </div>
    );
}
