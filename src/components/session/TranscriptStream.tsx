"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpeakerBadge } from "./SpeakerBadge";
import { cn } from "@/lib/utils";

interface TranscriptItem {
    id: string;
    speaker: "counselor" | "patient";
    text: string;
    timestamp: string;
}

// Mock initial data
const INITIAL_TRANSCRIPT: TranscriptItem[] = [
    { id: "1", speaker: "counselor", text: "지난 세션 이후 기분은 좀 어떠셨어요?", timestamp: "10:00" },
    { id: "2", speaker: "patient", text: "음, 조금 나아진 것 같아요. 하지만 면접 생각을 하면 여전히 가슴이 답답해요.", timestamp: "10:01" },
    { id: "3", speaker: "counselor", text: "답답하다는 느낌... 좀 더 자세히 설명해 주실 수 있나요? 날카로운 느낌인가요, 아니면 무거운 느낌인가요?", timestamp: "10:02" },
    { id: "4", speaker: "patient", text: "무거운 돌이 얹혀있는 것 같아요. 가끔은 숨쉬기도 힘들고요.", timestamp: "10:02" },
];

export function TranscriptStream() {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-white/50 rounded-2xl border border-[var(--color-midnight-navy)]/5 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 bg-white/40">
                <h3 className="text-sm font-semibold text-[var(--color-midnight-navy)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    실시간 대화 (Live Transcript)
                </h3>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                <AnimatePresence>
                    {INITIAL_TRANSCRIPT.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col gap-2 max-w-[85%]",
                                item.speaker === "counselor" ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <SpeakerBadge speaker={item.speaker} />
                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                item.speaker === "counselor"
                                    ? "bg-[var(--color-midnight-navy)] text-white rounded-tr-sm"
                                    : "bg-white text-[var(--color-midnight-navy)] rounded-tl-sm border border-[var(--color-midnight-navy)]/5"
                            )}>
                                {item.text}
                            </div>
                            <span className="text-[10px] text-[var(--color-midnight-navy)]/40 font-mono">
                                {item.timestamp}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
