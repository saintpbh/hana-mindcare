"use client";

import { cn } from "@/lib/utils";
import { Clock, MapPin, ChevronRight } from "lucide-react";

export function MobileSchedule() {
    const SCHEDULE = [
        { id: 1, time: "10:00", name: "박지은", type: "초기 면담", status: "completed" },
        { id: 2, time: "14:00", name: "김민준", type: "정기 상담", status: "rescheduled" },
        { id: 3, time: "16:00", name: "이서연", type: "온라인", status: "upcoming" },
    ];

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-[var(--color-midnight-navy)] px-1">오늘의 일정</h3>

            <div className="space-y-3">
                {SCHEDULE.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--color-midnight-navy)]/5 shadow-sm active:scale-[0.98] transition-all",
                            item.status === "rescheduled" && "border-amber-200 bg-amber-50/50"
                        )}
                    >
                        <div className="text-center min-w-[3rem]">
                            <span className="block text-sm font-bold text-[var(--color-midnight-navy)]">{item.time}</span>
                            <span className="text-[10px] text-[var(--color-midnight-navy)]/40">50min</span>
                        </div>

                        <div className="w-px h-8 bg-[var(--color-midnight-navy)]/10" />

                        <div className="flex-1">
                            <h4 className="font-bold text-[var(--color-midnight-navy)] flex items-center gap-2">
                                {item.name}
                                {item.status === "rescheduled" && (
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">변경됨</span>
                                )}
                            </h4>
                            <span className="text-xs text-[var(--color-midnight-navy)]/60">{item.type}</span>
                        </div>

                        <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                            <ChevronRight className="w-5 h-5 text-[var(--color-midnight-navy)]/20" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
