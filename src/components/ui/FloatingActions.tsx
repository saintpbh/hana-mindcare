"use client";

import { Mic, Pause, Square, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingActions({
    isRecording = true,
    onToggleRecording,
    onToggleInsights
}: {
    isRecording?: boolean;
    onToggleRecording?: () => void;
    onToggleInsights?: () => void;
}) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-[var(--color-midnight-navy)]/10 z-40">
            <button
                onClick={onToggleRecording}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-midnight-navy)] text-white hover:bg-[var(--color-midnight-navy)]/90 transition-colors"
            >
                {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="h-8 w-px bg-[var(--color-midnight-navy)]/10" />

            <button
                onClick={onToggleInsights}
                className={cn(
                    "px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors",
                    "bg-[var(--color-champagne-gold)]/10 text-[var(--color-midnight-navy)] hover:bg-[var(--color-champagne-gold)]/20"
                )}>
                <Sparkles className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                AI 인사이트
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                <Square className="w-4 h-4 fill-current" />
            </button>
        </div>
    );
}
