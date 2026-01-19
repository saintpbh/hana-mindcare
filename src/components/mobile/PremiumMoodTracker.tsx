"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveMood } from "@/app/actions/mood";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PremiumMoodTrackerProps {
    clientId: string;
}

const MOODS = [
    { score: 1, label: "Sad", color: "bg-indigo-400", glow: "shadow-indigo-400/50", emoji: "😔" },
    { score: 2, label: "Anxious", color: "bg-amber-400", glow: "shadow-amber-400/50", emoji: "😰" },
    { score: 3, label: "Calm", score_val: 5, color: "bg-emerald-400", glow: "shadow-emerald-400/50", emoji: "🧘" },
    { score: 3, label: "Happy", score_val: 7, color: "bg-rose-400", glow: "shadow-rose-400/50", emoji: "😊" },
];

export function PremiumMoodTracker({ clientId }: PremiumMoodTrackerProps) {
    const [selectedScore, setSelectedScore] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleMoodSelect = async (score: number) => {
        setSelectedScore(score);
        setIsSaving(true);
        const res = await saveMood(clientId, score);
        setIsSaving(false);
        if (res.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-champagne-gold)]/10 to-transparent rounded-bl-full pointer-events-none" />

            <h3 className="text-lg font-serif text-[var(--color-midnight-navy)] mb-6 text-center">오늘 하루는 어떠신가요?</h3>

            <div className="flex justify-around items-end gap-2 h-32 px-2">
                {MOODS.map((mood, idx) => (
                    <motion.button
                        key={mood.label}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoodSelect(mood.score)}
                        disabled={isSaving}
                        className="flex flex-col items-center gap-3 group relative"
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-lg",
                            mood.color,
                            selectedScore === mood.score ? `scale-110 ring-4 ring-white shadow-[0_0_20px_rgba(0,0,0,0.1)] ${mood.glow}` : "opacity-40 group-hover:opacity-100 grayscale-[0.5] group-hover:grayscale-0"
                        )}>
                            {mood.emoji}
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider transition-colors",
                            selectedScore === mood.score ? "text-[var(--color-midnight-navy)]" : "text-[var(--color-midnight-navy)]/30"
                        )}>
                            {mood.label}
                        </span>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-[32px] z-10"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Check className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-[var(--color-midnight-navy)]">기록이 저장되었습니다.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
