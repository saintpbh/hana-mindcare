"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, X, Music, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export function ZenSpace({ clientId }: { clientId: string }) {
    const [isBreathing, setIsBreathing] = useState(false);
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [timer, setTimer] = useState(4);

    useEffect(() => {
        let interval: any;
        if (isBreathing) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        if (phase === "inhale") { setPhase("hold"); return 4; }
                        if (phase === "hold") { setPhase("exhale"); return 4; }
                        if (phase === "exhale") { setPhase("inhale"); return 4; }
                        return 4;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimer(4);
            setPhase("inhale");
        }
        return () => clearInterval(interval);
    }, [isBreathing, phase]);

    return (
        <div className="space-y-6 pb-32">
            <header className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-serif text-[var(--color-midnight-navy)]">Zen Space</h3>
                    <p className="text-sm text-[var(--color-midnight-navy)]/40">잠시 숨을 고르며 마음을 챙겨보세요.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-[var(--color-midnight-navy)]/40" />
                </div>
            </header>

            {/* Breathing Guide */}
            <div className="relative aspect-square w-full bg-gradient-to-br from-[var(--color-midnight-navy)] to-[#1a2b4b] rounded-[40px] overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl">
                {/* Visualizer Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-champagne-gold)_0%,_transparent_70%)] animate-pulse" />
                </div>

                <AnimatePresence mode="wait">
                    {!isBreathing ? (
                        <motion.button
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setIsBreathing(true)}
                            className="bg-white text-[var(--color-midnight-navy)] w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-xl hover:scale-105 transition-transform"
                        >
                            <Wind className="w-8 h-8 mb-2" />
                            <span className="font-bold">심호흡 시작</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="breathing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center w-full"
                        >
                            {/* The Breathing Circle */}
                            <motion.div
                                animate={{
                                    scale: phase === "inhale" ? [1, 1.5] : phase === "hold" ? 1.5 : [1.5, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    ease: "easeInOut",
                                }}
                                className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center"
                            >
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-[var(--color-champagne-gold)]"
                                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            </motion.div>

                            <div className="mt-12 text-center text-white space-y-2">
                                <motion.div
                                    key={phase}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl font-serif"
                                >
                                    {phase === "inhale" ? "숨을 들이마시세요" :
                                        phase === "hold" ? "잠시 멈추세요" : "숨을 내뱉으세요"}
                                </motion.div>
                                <div className="text-4xl font-mono font-bold text-[var(--color-champagne-gold)]">
                                    {timer}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsBreathing(false)}
                                className="mt-8 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                중단하기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Recommended Tracks */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">나를 위한 큐레이션</h4>
                    <button className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">전체보기</button>
                </div>

                <div className="space-y-3">
                    {[
                        { title: "비 내리는 숲의 오후", type: "빗소리", dur: "15:00" },
                        { title: "불안을 잠재우는 명상", type: "가이드", dur: "10:00" },
                        { title: "집중을 돕는 파도소리", type: "화이트노이즈", dur: "20:00" },
                    ].map((track, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-[var(--color-midnight-navy)]/5 flex items-center gap-4 group cursor-pointer hover:border-[var(--color-champagne-gold)]/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-warm-white)] flex items-center justify-center group-hover:bg-[var(--color-champagne-gold)]/10 transition-colors">
                                <Play className="w-4 h-4 text-[var(--color-midnight-navy)]/40 group-hover:text-[var(--color-champagne-gold)]" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm text-[var(--color-midnight-navy)]">{track.title}</div>
                                <div className="text-[10px] text-gray-400 capitalize">{track.type} • {track.dur}</div>
                            </div>
                            <Music className="w-4 h-4 text-gray-200" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
