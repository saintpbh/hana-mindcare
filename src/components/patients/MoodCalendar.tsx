"use client";

import { cn } from "@/lib/utils";
import { Tooltip } from "recharts"; // Reusing types, or just HTML title

function generateDays(year: number) {
    const days = [];
    // Roughly 52 weeks * 7 days
    for (let i = 0; i < 365; i++) {
        // Random sentiment 0-4
        days.push(Math.floor(Math.random() * 5));
    }
    return days;
}

export function MoodCalendar() {
    const data = generateDays(2025);

    // 0: Missing, 1: Very Low, 2: Low, 3: Neutral, 4: High/Good
    const colors = [
        "bg-gray-100", // 0
        "bg-[var(--color-midnight-navy)]/80", // 1 (Bad)
        "bg-[var(--color-midnight-navy)]/40", // 2
        "bg-[var(--color-champagne-gold)]/40", // 3
        "bg-[var(--color-champagne-gold)]" // 4 (Good)
    ];

    return (
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[var(--color-midnight-navy)]">연간 기분 캘린더 (Mood History)</h3>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--color-midnight-navy)]/40">불안정</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[var(--color-midnight-navy)]/80" />
                        <div className="w-3 h-3 rounded-sm bg-[var(--color-midnight-navy)]/40" />
                        <div className="w-3 h-3 rounded-sm bg-[var(--color-champagne-gold)]/40" />
                        <div className="w-3 h-3 rounded-sm bg-[var(--color-champagne-gold)]" />
                    </div>
                    <span className="text-[var(--color-midnight-navy)]/40">안정</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1">
                {data.map((mood, i) => (
                    <div
                        key={i}
                        className={cn("w-3 h-3 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer", colors[mood])}
                        title={`Day ${i + 1}: Sentiment Level ${mood}`}
                    />
                ))}
            </div>
        </div>
    );
}
