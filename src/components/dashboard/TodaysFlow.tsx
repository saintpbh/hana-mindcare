"use client";

import { cn } from "@/lib/utils";
import { Clock, MoreVertical, Video, FileText, Link2, Clock4, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Client } from "@prisma/client";

interface TodaysFlowProps {
    sessions: Client[];
}

export function TodaysFlow({ sessions }: TodaysFlowProps) {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    // Calculate status helper
    const getStatus = (time: string, duration: number = 50) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeVal = currentHour * 60 + currentMin;

        const [h, m] = time.split(':').map(Number);
        const sessionStart = h * 60 + m;
        const sessionEnd = sessionStart + duration;

        if (currentTimeVal > sessionEnd) return 'completed';
        if (currentTimeVal >= sessionStart && currentTimeVal <= sessionEnd) return 'current';
        return 'upcoming';
    };

    const handleQuickAction = (e: React.MouseEvent, action: string, client: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (action === "summary") showToast(`${client} 님 지난 세션 요약 로드 중...`);
        if (action === "link") showToast("비대면 링크가 복사되었습니다.");
        if (action === "delay") showToast("5분 지연 알림이 발송되었습니다.");
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[var(--color-midnight-navy)]">오늘의 흐름 (Today's Flow)</h3>
                <button className="text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-midnight-navy)] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-20 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Check className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[2.5rem] top-2 bottom-2 w-px bg-[var(--color-midnight-navy)]/10" />

                {sessions.length === 0 ? (
                    <div className="text-center py-10 text-[var(--color-midnight-navy)]/50">
                        오늘 예정된 일정이 없습니다.
                    </div>
                ) : (
                    sessions.map((session) => {
                        const status = getStatus(session.sessionTime);
                        return (
                            <div key={session.id} className={cn("relative flex gap-6 group", status === "completed" && "opacity-60")}>
                                {/* Time Column */}
                                <div className="w-10 text-right shrink-0 pt-1">
                                    <span className="text-sm font-medium text-[var(--color-midnight-navy)]/60 font-mono">
                                        {session.sessionTime}
                                    </span>
                                </div>

                                {/* Node */}
                                <div className="relative shrink-0 pt-1.5">
                                    {status === "current" ? (
                                        <div className="w-4 h-4 rounded-full bg-[var(--color-champagne-gold)] shadow-[0_0_0_4px_rgba(215,185,142,0.2)] animate-pulse" />
                                    ) : status === "completed" ? (
                                        <div className="w-3 h-3 rounded-full bg-[var(--color-midnight-navy)]/20" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-[var(--color-midnight-navy)]/20" />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 relative group/card">
                                    <Link
                                        href={status === 'current' ? `/session/${session.id}` : `/patients/${session.id}`}
                                        className="block"
                                    >
                                        <div className={cn(
                                            "p-4 rounded-2xl border transition-all relative overflow-hidden",
                                            status === 'current'
                                                ? "bg-[var(--color-midnight-navy)] text-white shadow-lg border-transparent transform scale-[1.02]"
                                                : "bg-white border-[var(--color-midnight-navy)]/5 hover:border-[var(--color-champagne-gold)]/50 hover:shadow-sm"
                                        )}>
                                            <div className="flex justify-between items-start mb-1 relative z-10">
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                                    status === 'current'
                                                        ? "bg-white/10 text-white"
                                                        : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60"
                                                )}>
                                                    {session.tags.includes('intake') ? '초기 면담' : '정기 상담'}
                                                </span>
                                                {status === 'current' && (
                                                    <span className="flex items-center gap-1 text-xs text-[var(--color-champagne-gold)] animate-pulse">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-champagne-gold)]" />
                                                        진행 중
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className={cn("text-lg font-bold mb-1 relative z-10", status === 'current' ? "text-white" : "text-[var(--color-midnight-navy)]")}>
                                                {session.name} 님
                                            </h4>
                                            <div className={cn("flex items-center gap-2 text-xs relative z-10", status === 'current' ? "text-white/60" : "text-[var(--color-midnight-navy)]/40")}>
                                                <Clock className="w-3 h-3" />
                                                <span>50min</span>
                                                <span className="opacity-50">•</span>
                                                <Video className="w-3 h-3" />
                                            </div>

                                            {/* Quick Actions Overlay (Appears on Hover) */}
                                            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm z-20">
                                                <button
                                                    onClick={(e) => handleQuickAction(e, "summary", session.name)}
                                                    className="p-2 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)] hover:text-white transition-colors flex flex-col items-center gap-1 w-16 h-16 justify-center"
                                                    title="지난 요약"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold">요약</span>
                                                </button>

                                                <button
                                                    onClick={(e) => handleQuickAction(e, "link", session.name)}
                                                    className="p-2 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)] hover:text-white transition-colors flex flex-col items-center gap-1 w-16 h-16 justify-center"
                                                    title="링크 복사"
                                                >
                                                    <Link2 className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold">링크</span>
                                                </button>

                                                <button
                                                    onClick={(e) => handleQuickAction(e, "delay", session.name)}
                                                    className="p-2 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)] hover:text-white transition-colors flex flex-col items-center gap-1 w-16 h-16 justify-center"
                                                    title="5분 지연 알림"
                                                >
                                                    <Clock4 className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold">지연</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
