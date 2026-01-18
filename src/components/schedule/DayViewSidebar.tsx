"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Clock, Video, MoreVertical, FileText, Link2, Clock4 } from "lucide-react";
import Link from "next/link";

interface DayViewSidebarProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    appointments: any[]; // Using existing type for now
    sessions: any[]; // For today's flow list
}

export function DayViewSidebar({ currentDate, onDateChange, appointments, sessions }: DayViewSidebarProps) {
    // Mini Calendar Logic
    const miniCalendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0
        const totalDays = lastDay.getDate();

        const days = [];
        // Pad start
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: 0, current: false });
        }
        // Current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({ day: i, current: true });
        }
        // Pad end to 35 or 42
        while (days.length < 35) {
            days.push({ day: 0, current: false });
        }
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onDateChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onDateChange(newDate);
    };

    const handleDateClick = (day: number) => {
        if (day === 0) return;
        const newDate = new Date(currentDate);
        newDate.setDate(day);
        onDateChange(newDate);
    }

    // Today's Flow Helper
    const getStatus = (time: string, duration: number = 50) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeVal = currentHour * 60 + currentMin;

        // Mock parsing time string "10:00"
        const [h, m] = time.split(':').map(Number);
        const sessionStart = h * 60 + (m || 0);
        const sessionEnd = sessionStart + duration;

        if (currentTimeVal > sessionEnd) return 'completed';
        if (currentTimeVal >= sessionStart && currentTimeVal <= sessionEnd) return 'current';
        return 'upcoming';
    };

    return (
        <aside className="w-[320px] flex flex-col gap-4 shrink-0 h-full border-r border-[var(--color-midnight-navy)]/5 bg-white/50 p-4 overflow-y-auto">
            {/* 1. Mini Calendar */}
            <div className="bg-white p-4 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--color-midnight-navy)] font-semibold text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-black/5 rounded"><ChevronLeft className="w-4 h-4 opacity-50" /></button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-black/5 rounded"><ChevronRight className="w-4 h-4 opacity-50" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2">
                    {["월", "화", "수", "목", "금", "토", "일"].map(d => (
                        <div key={d} className="text-[var(--color-midnight-navy)]/40 font-bold">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {miniCalendarGrid.map((cell, i) => {
                        if (!cell.current) return <div key={i} className="" />;

                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                        const hasApt = appointments.some(a => a.rawDate === dateStr);
                        const isSelected = cell.day === currentDate.getDate();

                        return (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                                <div
                                    onClick={() => handleDateClick(cell.day)}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-[10px] font-medium",
                                        isSelected ? "bg-[var(--color-midnight-navy)] text-white shadow-md" : "hover:bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]"
                                    )}
                                >
                                    {cell.day}
                                </div>
                                <div className="h-1 flex gap-0.5">
                                    {hasApt && <div className="w-1 h-1 rounded-full bg-[var(--color-champagne-gold)]" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. Today's Clients List */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
                <h3 className="font-serif text-lg text-[var(--color-midnight-navy)] px-1">오늘의 내담자</h3>

                <div className="space-y-3 pb-4">
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-midnight-navy)]/40 text-sm bg-white rounded-xl border border-dashed border-[var(--color-midnight-navy)]/10">
                            오늘 예정된 상담이 없습니다.
                        </div>
                    ) : (
                        sessions.map(session => {
                            // Mock session time if missing for demo
                            const time = session.sessionTime || `${session.time}:00`;
                            const status = getStatus(time); // implement status logic

                            return (
                                <div key={session.id} className={cn(
                                    "p-3 rounded-xl border bg-white shadow-sm transition-all hover:shadow-md relative group",
                                    status === 'current' ? "border-[var(--color-midnight-navy)] ring-1 ring-[var(--color-midnight-navy)]/10" : "border-[var(--color-midnight-navy)]/5"
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                                status === 'current' ? "bg-[var(--color-midnight-navy)] text-white" : "bg-gray-100 text-gray-500"
                                            )}>
                                                {session.type}
                                            </span>
                                            {status === 'current' && <span className="text-[10px] text-[var(--color-champagne-gold)] font-bold animate-pulse">● 진행 중</span>}
                                        </div>
                                        <span className="text-xs font-mono text-[var(--color-midnight-navy)]/60">{time}</span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="font-bold text-[var(--color-midnight-navy)]">{session.title} 님</div>
                                            <div className="flex items-center gap-1 text-[10px] text-[var(--color-midnight-navy)]/50 mt-0.5">
                                                <MoreVertical className="w-3 h-3" />
                                                <span>회기 진행중</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="요약"><FileText className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="링크"><Link2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </aside>
    );
}
