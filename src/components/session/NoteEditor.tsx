"use client";

import { useState } from "react";
import { Maximize2, Minimize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function NoteEditor() {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <>
            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[var(--color-warm-white)] z-50"
                    />
                )}
            </AnimatePresence>

            <motion.div
                layout
                className={cn(
                    "flex flex-col bg-white rounded-2xl border border-[var(--color-midnight-navy)]/10 shadow-sm transition-all duration-500 ease-in-out",
                    isFocused ? "fixed inset-4 z-50 shadow-2xl" : "h-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-midnight-navy)]/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-champagne-gold)]/10 flex items-center justify-center text-[var(--color-champagne-gold)]">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-[var(--color-midnight-navy)]">상담 노트 (Session Notes)</h3>
                    </div>

                    <button
                        onClick={() => setIsFocused(!isFocused)}
                        className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full text-[var(--color-midnight-navy)]/60 transition-colors"
                    >
                        {isFocused ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>

                <textarea
                    className="flex-1 w-full p-6 resize-none outline-none text-[var(--color-midnight-navy)] text-base leading-relaxed placeholder:text-[var(--color-midnight-navy)]/30 bg-transparent font-serif"
                    placeholder="상담 내용을 자유롭게 기록하세요..."
                    autoFocus={isFocused}
                />

                <div className="p-4 border-t border-[var(--color-midnight-navy)]/5 flex items-center justify-between text-xs text-[var(--color-midnight-navy)]/40">
                    <span>{isFocused ? "Zen 모드 활성화" : "방금 자동 저장됨"}</span>
                    <span>Markdown 지원</span>
                </div>
            </motion.div>
        </>
    );
}
