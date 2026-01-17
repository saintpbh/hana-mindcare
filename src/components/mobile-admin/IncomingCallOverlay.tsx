"use client";

import { Phone, PhoneOff, MessageSquare, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface IncomingCallOverlayProps {
    onAccept: () => void;
    onDecline: () => void;
}

export function IncomingCallOverlay({ onAccept, onDecline }: IncomingCallOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Simulate incoming call after a delay
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-50 bg-[var(--color-midnight-navy)]/95 backdrop-blur-md flex flex-col items-center justify-between py-20 text-white"
            >
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto animate-pulse">
                            <User className="w-16 h-16 text-white/80" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-champagne-gold)]/50 animate-ping" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-serif mb-2">김민준 님</h2>
                        <p className="text-white/60">내담자 (Crisis Group)</p>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 max-w-xs mx-auto text-sm backdrop-blur-sm border border-white/10">
                        <p className="text-[var(--color-champagne-gold)] font-medium mb-1">Context</p>
                        <p className="text-white/80 leading-relaxed">
                            지난 세션(2일 전)에서 수면 장애 호소. <br />
                            "잠들기 어렵다"는 메시지 1시간 전 발송함.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-sm px-8 grid grid-cols-2 gap-8">
                    <button
                        onClick={onDecline}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                            <PhoneOff className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm font-medium">거절 / 메시지</span>
                    </button>

                    <button
                        onClick={onAccept}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform animate-bounce">
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm font-medium">통화 수락</span>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
