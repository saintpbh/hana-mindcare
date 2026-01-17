"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { IntakeWizard } from "@/components/schedule/IntakeWizard";
import { CalendarView } from "@/components/schedule/CalendarView";
import { EditAppointmentModal } from "@/components/schedule/EditAppointmentModal";

// Initial Data
const INITIAL_APPOINTMENTS = [
    { id: 1, title: "Sarah Chen", type: "Ongoing", time: 10, day: 0, duration: 1, color: "bg-teal-100 text-teal-900 border-teal-200" },
    { id: 2, title: "Michael Ross", type: "Intake", time: 14, day: 1, duration: 1.5, color: "bg-amber-100 text-amber-900 border-amber-200" },
    { id: 3, title: "Emma Wilson", type: "Crisis", time: 11, day: 2, duration: 1, color: "bg-rose-100 text-rose-900 border-rose-200" },
    { id: 4, title: "David Kim", type: "Ongoing", time: 16, day: 3, duration: 1, color: "bg-teal-100 text-teal-900 border-teal-200" },
];

export default function SchedulePage() {
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);

    const handleAddAppointment = (newApt: any) => {
        setAppointments([...appointments, { ...newApt, id: Date.now() }]);
    };

    const handleUpdateAppointment = (updated: any) => {
        setAppointments(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
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

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-[var(--color-midnight-navy)]/10 p-1">
                        <button className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium text-[var(--color-midnight-navy)]">2024년 10월 14일 - 18일</span>
                        <button className="p-1.5 hover:bg-[var(--color-midnight-navy)]/5 rounded-md text-[var(--color-midnight-navy)]/60">
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
                {/* Sidebar Mini Calendar & Filters */}
                <aside className="w-64 flex flex-col gap-6 shrink-0">
                    <div className="bg-white p-4 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-[var(--color-midnight-navy)] font-semibold">
                            <Calendar className="w-4 h-4" />
                            <span>2024년 10월</span>
                        </div>
                        {/* Simplified Mini Calendar Grid Placeholder */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {["월", "화", "수", "목", "금", "토", "일"].map(d => (
                                <div key={d} className="text-[var(--color-midnight-navy)]/40 font-medium py-1">{d}</div>
                            ))}
                            {Array.from({ length: 31 }, (_, i) => (
                                <div key={i} className={`py-1.5 rounded-md ${i === 13 ? 'bg-[var(--color-midnight-navy)] text-white' : 'hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider px-2">필터 (Filters)</h3>
                        <div className="bg-white p-4 rounded-xl border border-[var(--color-midnight-navy)]/5 shadow-sm space-y-3">
                            <label className="flex items-center gap-2 text-sm text-[var(--color-midnight-navy)] cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-[var(--color-midnight-navy)] focus:ring-[var(--color-midnight-navy)]" defaultChecked />
                                <span>진행 중 상담 (Ongoing)</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-[var(--color-midnight-navy)] cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-[var(--color-midnight-navy)] focus:ring-[var(--color-midnight-navy)]" defaultChecked />
                                <span>초기 면담 (Intake/New)</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-[var(--color-midnight-navy)] cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-[var(--color-midnight-navy)] focus:ring-[var(--color-midnight-navy)]" defaultChecked />
                                <span>위기 개입 (Crisis)</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Main Calendar View */}
                <CalendarView
                    appointments={appointments}
                    setAppointments={setAppointments}
                    onEditAppointment={(id) => setEditingAppointment(appointments.find(a => a.id === id))}
                />
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
