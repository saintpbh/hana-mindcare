"use client";

import { usePersistence } from "@/hooks/usePersistence";
import { cn } from "@/lib/utils";
import { Clock, MoreVertical, Video } from "lucide-react";
import Link from "next/link";

export function TodaysFlow() {
    // In a real app, we would filter sessions for today. 
    // For this demo, we'll create a static timeline that looks dynamic.

    const SCHEDULE = [
        {
            id: 1,
            time: "10:00",
            client: "김민준",
            type: "정기 상담",
            status: "completed",
            duration: "50min"
        },
        {
            id: 2,
            time: "14:00",
            client: "박지은",
            type: "초기 면담",
            status: "current",
            duration: "90min"
        },
        {
            id: 3,
            time: "16:30",
            client: "최현수",
            type: "정기 상담",
            status: "upcoming",
            duration: "50min"
        },
        {
            id: 4,
            time: "18:00",
            client: "이서연",
            type: "온라인 상담",
            status: "upcoming",
            duration: "50min"
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[var(--color-midnight-navy)]">오늘의 흐름 (Today's Flow)</h3>
                <button className="text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[2.5rem] top-2 bottom-2 w-px bg-[var(--color-midnight-navy)]/10" />

                {SCHEDULE.map((item, index) => (
                    <div key={item.id} className={cn("relative flex gap-6 group", item.status === "completed" && "opacity-60")}>
                        {/* Time Column */}
                        <div className="w-10 text-right shrink-0 pt-1">
                            <span className="text-sm font-medium text-[var(--color-midnight-navy)]/60 font-mono">
                                {item.time}
                            </span>
                        </div>

                        {/* Node */}
                        <div className="relative shrink-0 pt-1.5">
                            {item.status === "current" ? (
                                <div className="w-4 h-4 rounded-full bg-[var(--color-champagne-gold)] shadow-[0_0_0_4px_rgba(215,185,142,0.2)] animate-pulse" />
                            ) : item.status === "completed" ? (
                                <div className="w-3 h-3 rounded-full bg-[var(--color-midnight-navy)]/20" />
                            ) : (
                                <div className="w-3 h-3 rounded-full bg-white border-2 border-[var(--color-midnight-navy)]/20" />
                            )}
                        </div>

                        {/* Content Card */}
                        <Link href={`/patients/${item.id}`} className="flex-1 block">
                            <div className={cn(
                                "p-4 rounded-2xl border transition-all",
                                item.status === "current"
                                    ? "bg-[var(--color-midnight-navy)] text-white shadow-lg border-transparent transform scale-[1.02]"
                                    : "bg-white border-[var(--color-midnight-navy)]/5 hover:border-[var(--color-champagne-gold)]/50 hover:shadow-sm"
                            )}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full",
                                        item.status === "current"
                                            ? "bg-white/10 text-white"
                                            : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60"
                                    )}>
                                        {item.type}
                                    </span>
                                    {item.status === "current" && (
                                        <span className="flex items-center gap-1 text-xs text-[var(--color-champagne-gold)] animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-champagne-gold)]" />
                                            진행 중
                                        </span>
                                    )}
                                </div>
                                <h4 className={cn("text-lg font-bold mb-1", item.status === "current" ? "text-white" : "text-[var(--color-midnight-navy)]")}>
                                    {item.client} 님
                                </h4>
                                <div className={cn("flex items-center gap-2 text-xs", item.status === "current" ? "text-white/60" : "text-[var(--color-midnight-navy)]/40")}>
                                    <Clock className="w-3 h-3" />
                                    <span>{item.duration}</span>
                                    {item.type === "온라인 상담" && (
                                        <>
                                            <span>•</span>
                                            <Video className="w-3 h-3" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
