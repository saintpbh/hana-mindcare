"use client";

import { PlayCircle, Video, BookOpen, ChevronRight } from "lucide-react";

export function PrescriptionBox() {
    const prescriptions = [
        {
            id: 1,
            title: "불안을 잠재우는 5분 호흡",
            type: "video",
            date: "1일 전",
            icon: Video,
            color: "bg-indigo-100 text-indigo-600"
        },
        {
            id: 2,
            title: "인지 왜곡 식별하기 가이드",
            type: "article",
            date: "3일 전",
            icon: BookOpen,
            color: "bg-teal-100 text-teal-600"
        }
    ];

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-[var(--color-midnight-navy)] px-1">도착한 처방함</h3>

            {prescriptions.map((item) => (
                <button
                    key={item.id}
                    className="w-full bg-white p-4 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm flex items-center gap-4 hover:border-[var(--color-champagne-gold)]/50 transition-colors text-left"
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-[var(--color-midnight-navy)] truncate pr-2">
                                {item.title}
                            </h4>
                            <span className="text-[10px] text-[var(--color-midnight-navy)]/40 whitespace-nowrap bg-[var(--color-warm-white)] px-1.5 py-0.5 rounded">
                                {item.date}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-midnight-navy)]/60">
                            {item.type === "video" ? (
                                <><PlayCircle className="w-3 h-3" /> 동영상 시청하기</>
                            ) : (
                                <><BookOpen className="w-3 h-3" /> 읽기 자료</>
                            )}
                        </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[var(--color-midnight-navy)]/20" />
                </button>
            ))}
        </div>
    );
}
