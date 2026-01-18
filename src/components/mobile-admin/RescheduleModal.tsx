"use client";

import { useState } from "react";
import { X, Check, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "@/data/mockClients";
import { usePersistence } from "@/hooks/usePersistence";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
}

export function RescheduleModal({ isOpen, onClose, client }: RescheduleModalProps) {
    const { clients, updateClient } = usePersistence();
    const [selectedDate, setSelectedDate] = useState<string>(client.nextSession);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    if (!isOpen) return null;

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ko-KR", { weekday: 'long', month: 'long', day: 'numeric' });
    };

    // Calculate dates (Today, Tomorrow, Next Week) based on current nextSession for demo
    // Ideally this would be relative to 'today', but for demo we pivot around the client's current session or fixed dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    // Simple date switching logic for demo
    const availableDates = [today, tomorrow, client.nextSession].filter((v, i, a) => a.indexOf(v) === i);
    // ensure nextSession is included if it's not today or tomorrow

    const timeSlots = [
        "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    // Conflict Detection
    const getSlotStatus = (time: string) => {
        const conflict = clients.find(c => c.nextSession === selectedDate && c.sessionTime === time && c.id !== client.id);
        if (conflict) return { status: "busy", name: conflict.name };
        return { status: "available", name: null };
    };

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            updateClient({
                ...client,
                nextSession: selectedDate,
                sessionTime: selectedTime
            });
            onClose();
        }
    };

    const handleQuickPostpone = () => {
        // Postpone to next week same time
        const nextWeek = new Date(new Date(client.nextSession).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updateClient({
            ...client,
            nextSession: nextWeek
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--color-midnight-navy)]">일정 변경</h3>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">상담 가능한 시간을 확인하세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/40 hover:bg-[var(--color-midnight-navy)]/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Fast Action */}
                <button
                    onClick={handleQuickPostpone}
                    className="w-full mb-6 py-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                    <Clock className="w-4 h-4" />
                    다음주 동일 시간으로 연기 (Fast Track)
                </button>

                {/* Date Selection tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Hardcoded 3 dates for simplicity + custom input trigger in future */}
                    {[today, tomorrow, client.nextSession].filter((d, i, a) => a.indexOf(d) === i).map((date) => (
                        <button
                            key={date}
                            onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime(null);
                            }}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                                selectedDate === date
                                    ? "bg-[var(--color-midnight-navy)] text-white border-transparent shadow-md"
                                    : "bg-white text-[var(--color-midnight-navy)]/60 border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-warm-white)]"
                            )}
                        >
                            {date === today ? "오늘" : date === tomorrow ? "내일" : date}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            const input = window.prompt("날짜 입력 (YYYY-MM-DD):", selectedDate);
                            if (input) setSelectedDate(input);
                        }}
                        className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors border bg-white text-[var(--color-midnight-navy)]/60 border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-warm-white)]"
                    >
                        날짜 선택...
                    </button>
                </div>

                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-midnight-navy)]">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(selectedDate)}</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {timeSlots.map(time => {
                        const { status, name } = getSlotStatus(time);
                        const isSelected = selectedTime === time;

                        return (
                            <button
                                key={time}
                                disabled={status === "busy"}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                    "relative p-3 rounded-xl border text-center transition-all",
                                    status === "busy"
                                        ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                        : isSelected
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.02]"
                                            : "bg-white border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] hover:border-[var(--color-midnight-navy)]/30 active:scale-[0.98]"
                                )}
                            >
                                <span className="block text-sm font-bold">{time}</span>
                                {status === "busy" ? (
                                    <span className="block text-[10px] truncate mt-1">{name}</span>
                                ) : (
                                    <span className={cn("block text-[10px] mt-1 font-medium", isSelected ? "text-emerald-100" : "text-emerald-500")}>
                                        {isSelected ? <Check className="w-3 h-3 mx-auto" /> : "가능"}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Action */}
                <button
                    disabled={!selectedTime}
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-xl bg-[var(--color-midnight-navy)] text-white font-bold text-lg shadow-lg shadow-[var(--color-midnight-navy)]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                    일정 변경 완료
                </button>

            </div>
        </div>
    );
}
