"use client";

import { Brain, Sparkles, ArrowRight, Activity, Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BriefingProps {
    className?: string;
}

const INSIGHTS = [
    {
        id: 1,
        type: "crisis",
        client: "이민준",
        message: "지난 세션에서 수면 패턴의 급격한 변화가 감지되었습니다. 금일 세션 시작 시 수면 일지를 먼저 확인하는 것이 좋겠습니다.",
        action: "수면 일지 확인",
        icon: Activity,
        color: "bg-rose-100 text-rose-600",
        link: "/patients/1?view=analysis" // Direct to analysis/notes
    },
    {
        id: 2,
        type: "intake",
        client: "박지은",
        message: "초기 면담 예약입니다. 사전 질문지에 따르면 직무 스트레스 관련 주제가 주를 이룰 것으로 예상됩니다.",
        action: "사전 질문지 보기",
        icon: Brain,
        color: "bg-teal-100 text-teal-600",
        link: "/patients/2"
    },
    {
        id: 3,
        type: "schedule",
        client: "최현수",
        message: "3주 만의 방문입니다. 지난 과제(감정 일기) 수행 여부를 부드럽게 체크해보세요.",
        action: "지난 노트 보기",
        icon: Calendar,
        color: "bg-amber-100 text-amber-600",
        link: "/patients/3?view=records" // Direct to records
    }
];

export function IntelligentBriefing({ className }: BriefingProps) {
    const [greeting, setGreeting] = useState("안녕하세요");
    const [currentTime, setCurrentTime] = useState("");
    const [activeInsightIndex, setActiveInsightIndex] = useState(0);

    // Sort: Crisis first
    const sortedInsights = [...INSIGHTS].sort((a, b) => {
        if (a.type === 'crisis') return -1;
        if (b.type === 'crisis') return 1;
        return 0;
    });

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("좋은 아침입니다");
            else if (hour < 18) setGreeting("즐거운 오후입니다");
            else setGreeting("편안한 저녁입니다");

            setCurrentTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        };

        updateGreeting();
        const timer = setInterval(updateGreeting, 60000);
        return () => clearInterval(timer);
    }, []);

    const nextInsight = () => {
        setActiveInsightIndex((prev) => (prev + 1) % sortedInsights.length);
    };

    const currentInsight = sortedInsights[activeInsightIndex];

    return (
        <div className={cn("bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300", className)}>
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-champagne-gold)]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left: Greeting & Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-[var(--color-champagne-gold)] font-medium mb-3"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest">AI 인텔리전트 브리핑</span>
                        </motion.div>
                        <h2 className="text-3xl font-serif text-[var(--color-midnight-navy)] leading-tight mb-2">
                            {greeting},<br />김하나 선생님.
                        </h2>
                        <p className="text-[var(--color-midnight-navy)]/60 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            현재 시각 {currentTime}
                        </p>
                    </div>

                    <div className="p-4 bg-[var(--color-warm-white)]/50 rounded-2xl border border-[var(--color-midnight-navy)]/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-[var(--color-midnight-navy)]/60">오늘의 세션</span>
                            <span className="text-lg font-bold text-[var(--color-midnight-navy)]">4건</span>
                        </div>
                        <div className="w-full bg-[var(--color-midnight-navy)]/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[var(--color-champagne-gold)] w-1/4 h-full rounded-full" />
                        </div>
                        <div className="mt-2 text-xs text-[var(--color-midnight-navy)]/40 text-right">
                            1건 완료 / 3건 예정
                        </div>
                    </div>
                </div>

                {/* Right: Insights Carousel */}
                <div className="lg:col-span-2 relative h-full min-h-[180px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-[var(--color-midnight-navy)] flex items-center gap-2">
                            주요 알림 및 인사이트
                            {sortedInsights[0].type === 'crisis' && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={nextInsight}
                                className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5 transition-colors text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeInsightIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                <Link href={currentInsight.link} className="block">
                                    <div className={cn(
                                        "p-6 rounded-2xl border transition-all shadow-sm group/card cursor-pointer relative overflow-hidden",
                                        currentInsight.type === 'crisis'
                                            ? "bg-rose-50/30 border-rose-200 hover:border-rose-400 shadow-rose-100"
                                            : "bg-white border-[var(--color-midnight-navy)]/10 hover:border-[var(--color-champagne-gold)]/50"
                                    )}>
                                        {currentInsight.type === 'crisis' && (
                                            <div className="absolute top-0 right-0 px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-bl-xl">
                                                PRIORITY
                                            </div>
                                        )}

                                        <div className="flex gap-5 items-start">
                                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", currentInsight.color)}>
                                                {(() => {
                                                    const InsightIcon = currentInsight.icon;
                                                    return <InsightIcon className="w-6 h-6" />;
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-[var(--color-midnight-navy)] flex items-center gap-2">
                                                            {currentInsight.client}
                                                            <span className={cn(
                                                                "text-xs font-normal px-2 py-0.5 rounded-full",
                                                                currentInsight.type === 'crisis'
                                                                    ? "bg-rose-100 text-rose-600 font-bold"
                                                                    : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60"
                                                            )}>
                                                                {currentInsight.type === "crisis" ? "위기 개입" :
                                                                    currentInsight.type === "intake" ? "초기 면담" : "정기 상담"}
                                                            </span>
                                                        </h4>
                                                    </div>
                                                    <span className="text-xs font-medium text-[var(--color-champagne-gold)] flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                        바로가기 <ChevronRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                                <p className="text-[var(--color-midnight-navy)]/70 mt-2 leading-relaxed">
                                                    {currentInsight.message}
                                                </p>
                                                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 px-3 py-1.5 rounded-lg">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    {currentInsight.action}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
