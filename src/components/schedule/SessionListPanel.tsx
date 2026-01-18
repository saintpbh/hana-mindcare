"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Clock, FileText, CalendarDays } from "lucide-react";

interface Session {
    id: string;
    date: Date;
    duration: number;
    summary: string;
    type: string;
}

interface SessionListPanelProps {
    sessions?: Session[];
    clientName?: string;
    onSessionClick?: (sessionId: string) => void;
}

export function SessionListPanel({ sessions = [], clientName, onSessionClick }: SessionListPanelProps) {
    // Group sessions by month if needed, for now flat list

    if (!sessions || sessions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-[var(--color-midnight-navy)]/40 p-6 text-center">
                <CalendarDays className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">완료된 상담 기록이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 shrink-0 bg-white sticky top-0 z-10">
                <h3 className="text-sm font-bold text-[var(--color-midnight-navy)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-midnight-navy)]/60" />
                    최근 상담 기록
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSessionClick?.(session.id)}
                        className="group relative pl-4 pb-4 border-l-2 border-[var(--color-midnight-navy)]/10 last:pb-0 last:border-l-0 hover:border-[var(--color-midnight-navy)]/30 transition-colors cursor-pointer"
                    >
                        {/* Timeline Dot */}
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-[var(--color-midnight-navy)]/20 group-hover:border-[var(--color-midnight-navy)]group-hover:bg-[var(--color-midnight-navy)]/5 transition-colors" />

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[var(--color-midnight-navy)]">
                                    {new Date(session.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                                </span>
                                <span className="text-[10px] text-[var(--color-midnight-navy)]/40 font-medium px-1.5 py-0.5 bg-[var(--color-midnight-navy)]/5 rounded-full">
                                    {session.duration}분
                                </span>
                            </div>

                            <p className="text-sm text-[var(--color-midnight-navy)]/80 line-clamp-3 leading-relaxed">
                                {session.summary || "상담 요약이 없습니다."}
                            </p>

                            <div className="pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[10px] text-[var(--color-midnight-navy)] font-medium hover:underline flex items-center gap-0.5">
                                    상세보기 <Clock className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
