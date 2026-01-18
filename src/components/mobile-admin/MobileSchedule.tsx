"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, MapPin, ChevronRight, CalendarOff, AlertOctagon } from "lucide-react";
import { usePersistence } from "@/hooks/usePersistence";
import { type Client } from "@prisma/client";

interface MobileScheduleProps {
    onSelectClient: (client: Client) => void;
    onViewCalendar?: () => void;
}

export function MobileSchedule({ onSelectClient, onViewCalendar }: MobileScheduleProps) {
    const { clients, isLoaded } = usePersistence();
    const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("week");

    if (!isLoaded) return <div className="text-center p-4 opacity-50">로드 중...</div>;

    // Date Helpers
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    // Filtering Logic
    const filteredClients = clients.filter(client => {
        const sessionDate = new Date(client.nextSession);

        if (activeTab === "today") {
            return client.nextSession === todayStr;
        } else if (activeTab === "week") {
            return sessionDate >= today && sessionDate <= nextWeek;
        } else {
            return sessionDate >= today && sessionDate <= nextMonth;
        }
    }).sort((a, b) => {
        // Sort by date then time
        const dateA = new Date(`${a.nextSession}T${a.sessionTime || "00:00"}`).getTime();
        const dateB = new Date(`${b.nextSession}T${b.sessionTime || "00:00"}`).getTime();
        return dateA - dateB;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-[var(--color-midnight-navy)]">예정된 일정</h3>
                {/* <button
                    onClick={onViewCalendar}
                    className="text-xs font-medium text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-[var(--color-midnight-navy)]/5 shadow-sm"
                >
                    <CalendarOff className="w-3.5 h-3.5" />
                    <span>달력 보기</span>
                </button> */}
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                {(["today", "week", "month"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === tab
                                ? "bg-white text-[var(--color-midnight-navy)] shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {tab === "today" ? "오늘" : tab === "week" ? "이번 주" : "이번 달"}
                    </button>
                ))}
            </div>

            {filteredClients.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/40">
                    <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">해당 기간에 예정된 일정이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredClients.map((client) => {
                        const isCanceled = client.isSessionCanceled;
                        const dateDisplay = activeTab === "today" ? "" : client.nextSession.slice(5) + " "; // Show date if not today view

                        return (
                            <div
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border shadow-sm active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden",
                                    isCanceled
                                        ? "bg-rose-50 border-rose-100 opacity-80"
                                        : "bg-white border-[var(--color-midnight-navy)]/5"
                                )}
                            >
                                {isCanceled && (
                                    <div className="absolute inset-x-0 top-0 h-1 bg-rose-500/20" />
                                )}

                                <div className={cn("text-center min-w-[3rem]", isCanceled && "opacity-50")}>
                                    <span className="block text-xs font-medium text-gray-400 mb-0.5">{dateDisplay}</span>
                                    <span className="block text-sm font-bold text-[var(--color-midnight-navy)]">
                                        {client.sessionTime || "미정"}
                                    </span>
                                </div>

                                <div className="w-px h-8 bg-[var(--color-midnight-navy)]/10" />

                                <div className="flex-1">
                                    <h4 className={cn("font-bold text-[var(--color-midnight-navy)] flex items-center gap-2", isCanceled && "line-through text-gray-400")}>
                                        {client.name}
                                        {client.location && (
                                            <span className="text-xs font-normal text-gray-500 no-underline">
                                                @{client.location.split(' ')[0]}
                                            </span>
                                        )}
                                    </h4>

                                    {isCanceled ? (
                                        <span className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-0.5">
                                            <AlertOctagon className="w-3 h-3" />
                                            상담 취소됨
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[var(--color-midnight-navy)]/60">{client.status}</span>
                                    )}
                                </div>

                                <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                                    <ChevronRight className="w-5 h-5 text-[var(--color-midnight-navy)]/20" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
