"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntakeWizard } from "@/components/schedule/IntakeWizard";
import { CalendarView } from "@/components/schedule/CalendarView";
import { EditAppointmentModal } from "@/components/schedule/EditAppointmentModal";
import { ScheduleDetailPanel } from "@/components/schedule/ScheduleDetailPanel";
import { SessionListPanel } from "@/components/schedule/SessionListPanel";
import { DayViewSidebar } from "@/components/schedule/DayViewSidebar";
import { ClientSelectModal } from "@/components/schedule/ClientSelectModal";
import { ExistingClientSearch } from "@/components/schedule/ExistingClientSearch";
import { QuickScheduleModal } from "@/components/schedule/QuickScheduleModal";
import { TrashModal } from "@/components/schedule/TrashModal";

import { useScheduleData } from "@/hooks/useScheduleData";
import { softDeleteAppointment } from "@/app/actions/appointments";

export default function SchedulePage() {
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [isExistingSearchOpen, setIsExistingSearchOpen] = useState(false);
    const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    // View State
    const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week");
    const [currentDate, setCurrentDate] = useState(new Date()); // Default to Today (System Time)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    // Data Hook (Phase 2 Refactor)
    const { appointments, setAppointments, isLoading, refresh } = useScheduleData(currentDate, currentView);

    // Smart Selection Logic: explicit select -> current time (mocked for demo) -> next upcoming
    const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

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
        if (currentView === "week") {
            newDate.setDate(newDate.getDate() - 7);
        } else if (currentView === "month") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (currentView === "week") {
            newDate.setDate(newDate.getDate() + 7);
        } else if (currentView === "month") {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };


    const handleAddAppointment = (newApt: any) => {
        setAppointments([...appointments, { ...newApt, id: Date.now() }]);
        // In reality, this should call createClient
    };

    const handleUpdateAppointment = (updated: any) => {
        setAppointments(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
        // In reality, this should call updateClient
    };

    const handleDeleteAppointment = async (id: number) => {
        const result = await softDeleteAppointment(id.toString());
        if (result.success) {
            await refresh(); // Refresh data from server
        }
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

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-lg border border-[var(--color-midnight-navy)]/10 p-1 shadow-sm">
                            <button onClick={handlePrev} className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60" title="이전">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 text-sm font-medium text-[var(--color-midnight-navy)] min-w-[140px] text-center">
                                {formatHeaderDate()}
                            </span>
                            <button onClick={handleNext} className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60" title="다음">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={goToToday}
                            className="h-9 px-4 rounded-lg bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] text-xs font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors shadow-sm"
                        >
                            오늘
                        </button>

                        <button
                            onClick={() => setIsTrashOpen(true)}
                            className="h-9 px-4 rounded-lg bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] text-xs font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors shadow-sm flex items-center gap-2"
                            title="휴지통"
                        >
                            <Trash2 className="w-4 h-4" />
                            휴지통
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSelectModalOpen(true)}
                        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-[var(--color-midnight-navy)] text-white hover:bg-[var(--color-midnight-navy)]/90 transition-colors shadow-md shadow-[var(--color-midnight-navy)]/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-sm font-medium">일정 추가</span>
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
                            onDelete={handleDeleteAppointment}
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

            {/* New Modals for Existing Client Scheduling */}
            <ClientSelectModal
                isOpen={isSelectModalOpen}
                onClose={() => setIsSelectModalOpen(false)}
                onSelectNew={() => {
                    setIsSelectModalOpen(false);
                    setIsIntakeOpen(true);
                }}
                onSelectExisting={() => {
                    setIsSelectModalOpen(false);
                    setIsExistingSearchOpen(true);
                }}
            />

            <ExistingClientSearch
                isOpen={isExistingSearchOpen}
                onClose={() => setIsExistingSearchOpen(false)}
                onSelectClient={(client) => {
                    setSelectedClient(client);
                    setIsExistingSearchOpen(false);
                    setIsQuickScheduleOpen(true);
                }}
            />

            <QuickScheduleModal
                isOpen={isQuickScheduleOpen}
                onClose={() => {
                    setIsQuickScheduleOpen(false);
                    setSelectedClient(null);
                }}
                client={selectedClient}
                onComplete={handleAddAppointment}
                existingAppointments={appointments}
            />

            <TrashModal
                isOpen={isTrashOpen}
                onClose={() => {
                    setIsTrashOpen(false);
                    refresh(); // Refresh appointments after closing trash
                }}
            />
        </div>
    );
}
