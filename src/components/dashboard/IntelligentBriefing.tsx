"use client";

import { Brain, Sparkles, ArrowRight, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BriefingProps {
    className?: string;
}

export function IntelligentBriefing({ className }: BriefingProps) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-champagne-gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-[var(--color-champagne-gold)] font-medium mb-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">AI 인텔리젼트 브리핑</span>
                        </motion.div>
                        <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)] leading-tight">
                            안녕하세요, 김 선생님.<br />
                            <span className="text-[var(--color-midnight-navy)]/60">오늘 예정된 중요 세션이 3건 있습니다.</span>
                        </h2>
                    </div>
                    <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 transition-colors">
                        <ArrowRight className="w-5 h-5 text-[var(--color-midnight-navy)]/40" />
                    </button>
                </div>

                {/* Insight Cards Carousel (Mock) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-midnight-navy)]/5 flex gap-4 items-start cursor-pointer hover:border-[var(--color-champagne-gold)]/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--color-midnight-navy)]">이민준님 (Crisis)</h3>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60 mt-1 line-clamp-2">
                                지난 세션에서 수면 패턴의 급격한 변화가 감지되었습니다. 금일 세션 시작 시 수면 일지를 먼저 확인하는 것이 좋겠습니다.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-midnight-navy)]/5 flex gap-4 items-start cursor-pointer hover:border-[var(--color-champagne-gold)]/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                            <Brain className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--color-midnight-navy)]">박지은님 (Intake)</h3>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60 mt-1 line-clamp-2">
                                초기 면담 예약입니다. 사전 질문지에 따르면 직무 스트레스 관련 주제가 주를 이룰 것으로 예상됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
