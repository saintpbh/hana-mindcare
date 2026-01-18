"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickNote() {
    const [note, setNote] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "linked">("idle");
    const [linkedName, setLinkedName] = useState("");

    useEffect(() => {
        const savedNote = localStorage.getItem("hana_quick_note");
        if (savedNote) setNote(savedNote);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNote(value);
        localStorage.setItem("hana_quick_note", value);

        // Smart Link Detection (Simulation)
        // If user typed "#Name ", trigger a fake "Link to Patient" action
        const match = value.match(/#([가-힣]{2,4})\s$/); // Matches "#홍길동 "
        if (match) {
            const name = match[1];
            setLinkedName(name);
            setStatus("saving");
            setTimeout(() => setStatus("linked"), 1000);
            setTimeout(() => setStatus("idle"), 4000);
        } else {
            setStatus("saving");
            const timeout = setTimeout(() => setStatus("saved"), 800);
            return () => clearTimeout(timeout);
        }
    };

    return (
        <div className="bg-[var(--color-warm-white)] rounded-3xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-inner h-full flex flex-col relative overflow-hidden transition-colors duration-500">
            {status === "linked" && (
                <div className="absolute inset-x-0 top-0 h-1 bg-green-500 z-10 animate-[loading_1s_ease-in-out]" />
            )}

            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[var(--color-midnight-navy)] text-sm uppercase tracking-wide flex items-center gap-2">
                    Quick Note
                    {/* Tooltip hint */}
                    <span className="text-[10px] text-[var(--color-midnight-navy)]/30 font-normal normal-case border border-[var(--color-midnight-navy)]/10 px-1.5 py-0.5 rounded">
                        Tip: #이름 으로 기록 연동
                    </span>
                </h3>

                <span className={cn(
                    "text-xs transition-all duration-300 font-medium flex items-center gap-1",
                    status === "idle" && "opacity-0",
                    status === "saving" && "text-[var(--color-midnight-navy)]/40 opacity-100",
                    status === "saved" && "text-[var(--color-champagne-gold)] opacity-100",
                    status === "linked" && "text-green-600 opacity-100"
                )}>
                    {status === "saving" && (
                        <>
                            <div className="w-2 h-2 border-2 border-[var(--color-midnight-navy)]/20 border-t-[var(--color-midnight-navy)] rounded-full animate-spin" />
                            Saving...
                        </>
                    )}
                    {status === "saved" && <><Save className="w-3 h-3" /> Saved</>}
                    {status === "linked" && (
                        <>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {linkedName}님 차트에 저장됨
                        </>
                    )}
                </span>
            </div>

            <textarea
                className="flex-1 w-full bg-transparent resize-none focus:outline-none text-[var(--color-midnight-navy)] text-sm placeholder-[var(--color-midnight-navy)]/30 leading-relaxed font-handwriting"
                placeholder="여기에 빠른 메모를 남기세요... (예: #김민준 상담 후 보호자 통화 필요)"
                value={note}
                onChange={handleChange}
            />
        </div>
    );
}
