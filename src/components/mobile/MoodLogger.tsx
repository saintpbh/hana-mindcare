"use client";

import { useState } from "react";
import { Smile, Meh, Frown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { saveMood } from "@/app/actions/mood";

export function MoodLogger({ clientId }: { clientId: string }) {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const moods = [
        { id: 1, icon: Frown, label: "우울해", color: "text-rose-400", score: 1 },
        { id: 2, icon: Meh, label: "그저 그래", color: "text-amber-400", score: 2 },
        { id: 3, icon: Smile, label: "괜찮아", color: "text-emerald-400", score: 3 },
    ];

    const handleSelect = async (score: number) => {
        setSelectedMood(score);
        setIsSaved(false);

        await saveMood(clientId, score);
        setIsSaved(true);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5">
            <h3 className="font-semibold text-[var(--color-midnight-navy)] mb-4">오늘 기분은 어때요?</h3>

            <div className="flex justify-between gap-2">
                {moods.map((mood) => (
                    <button
                        key={mood.id}
                        onClick={() => handleSelect(mood.score)}
                        className={cn(
                            "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                            selectedMood === mood.score
                                ? "bg-[var(--color-midnight-navy)]/5 scale-105 shadow-inner"
                                : "hover:bg-[var(--color-warm-white)]"
                        )}
                    >
                        <mood.icon
                            className={cn(
                                "w-8 h-8 transition-colors",
                                selectedMood === mood.score ? mood.color : "text-[var(--color-midnight-navy)]/20"
                            )}
                        />
                        <span className={cn(
                            "text-xs font-medium",
                            selectedMood === mood.score ? "text-[var(--color-midnight-navy)]" : "text-[var(--color-midnight-navy)]/40"
                        )}>
                            {mood.label}
                        </span>
                    </button>
                ))}
            </div>

            {isSaved && (
                <div className="mt-4 p-3 bg-[var(--color-champagne-gold)]/10 rounded-xl flex items-center justify-center gap-2 text-sm text-[var(--color-midnight-navy)] animate-in fade-in slide-in-from-bottom-2">
                    <Check className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                    <span>기분이 기록되었습니다.</span>
                </div>
            )}
        </div>
    );
}
