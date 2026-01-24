"use client";

import { Brain, Sparkles, ArrowRight, Activity, Calendar, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { type Client } from "@prisma/client";

import { useAuth } from "@/hooks/useAuth";

interface BriefingProps {
    className?: string;
    clients: Client[];
    sessionCount?: number;
}

export function IntelligentBriefing({ className, clients, sessionCount = 0 }: BriefingProps) {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState("안녕하세요");
    const [currentTime, setCurrentTime] = useState("");
    const [activeInsightIndex, setActiveInsightIndex] = useState(0);

    // Map clients to Insights format (Same logic)
    const sortedInsights = clients.map((client, index) => ({
        id: client.id,
        type: client.status === 'crisis' ? 'crisis' : (client.tags.includes('intake') ? 'intake' : 'schedule'),
        client: client.name,
        message: client.status === 'crisis'
            ? "위기 개입 필요"
            : (client.tags.includes('intake') ? "초기 면담 사전 질문지 확인" : "정기 상담 예정"),
        action: client.status === 'crisis' ? "상태 확인" : "차트 보기",
        icon: client.status === 'crisis' ? Activity : (client.tags.includes('intake') ? Brain : Calendar),
        link: `/patients/${client.id}` + (client.status === 'crisis' ? '?view=analysis' : '')
    })).sort((a, b) => {
        if (a.type === 'crisis') return -1;
        if (b.type === 'crisis') return 1;
        return 0;
    });

    if (sortedInsights.length === 0) {
        sortedInsights.push({
            id: 'demo',
            type: 'schedule',
            client: '시스템',
            message: '예정된 알림 없음',
            action: '일정 확인',
            icon: Sparkles,
            link: '/schedule'
        });
    }

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("좋은 아침");
            else if (hour < 18) setGreeting("즐거운 오후");
            else setGreeting("편안한 저녁");

            setCurrentTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        };

        updateGreeting();
        const timer = setInterval(updateGreeting, 60000);
        return () => clearInterval(timer);
    }, []);

    const nextInsight = () => setActiveInsightIndex((prev) => (prev + 1) % sortedInsights.length);
    const currentInsight = sortedInsights[activeInsightIndex];

    return (
        <div className={cn("bg-white rounded-[2rem] p-5 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-6", className)}>
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-champagne-gold)]/5 to-transparent rounded-bl-full pointer-events-none" />

            {/* Left: Greeting & Time (Compact) */}
            <div className="flex items-center gap-5 shrink-0">
                <div className="w-12 h-12 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center text-[var(--color-midnight-navy)]">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-midnight-navy)] leading-tight">
                        {greeting}, {user?.name || "선생님"}.
                    </h2>
                    <p className="text-sm text-[var(--color-midnight-navy)]/40 flex items-center gap-1.5 mt-0.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {currentTime}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-[var(--color-midnight-navy)]/10" />

            {/* Center: Session Status (Mini) */}
            <div className="hidden lg:flex items-center gap-4 shrink-0 px-2">
                <div className="text-right">
                    <div className="text-xs text-[var(--color-midnight-navy)]/40 font-medium">오늘의 세션</div>
                    <div className="text-lg font-bold text-[var(--color-midnight-navy)]">4<span className="text-sm font-normal text-[var(--color-midnight-navy)]/40">건</span></div>
                </div>
                <div className="w-32">
                    <div className="w-full bg-[var(--color-midnight-navy)]/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[var(--color-champagne-gold)] w-1/4 h-full rounded-full" />
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-10 bg-[var(--color-midnight-navy)]/10" />

            {/* Right: Active Alert / Insight (Horizontal Ticker Style) */}
            <div className="flex-1 w-full min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[var(--color-midnight-navy)]/30 uppercase tracking-wider flex items-center gap-1">
                        {currentInsight.type === 'crisis' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        INSIGHT
                    </span>
                    <button onClick={nextInsight} className="text-[var(--color-midnight-navy)]/20 hover:text-[var(--color-midnight-navy)] transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeInsightIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full"
                    >
                        <Link href={currentInsight.link} className="group block">
                            <div className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all relative overflow-hidden",
                                currentInsight.type === 'crisis'
                                    ? "bg-rose-50/50 border-rose-100 hover:border-rose-300"
                                    : "bg-[var(--color-warm-white)]/50 border-transparent hover:border-[var(--color-midnight-navy)]/10 hover:bg-white"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm",
                                    currentInsight.type === 'crisis' ? "bg-rose-400" : "bg-[var(--color-midnight-navy)]"
                                )}>
                                    {(() => {
                                        const Icon = currentInsight.icon;
                                        return <Icon className="w-4 h-4" />;
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[var(--color-midnight-navy)] text-sm truncate">{currentInsight.client}</span>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                                            currentInsight.type === 'crisis' ? "bg-rose-100 text-rose-600" : "bg-white text-[var(--color-midnight-navy)]/60"
                                        )}>
                                            {currentInsight.type === 'crisis' ? '위기' : '상담'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--color-midnight-navy)]/60 truncate pr-4">
                                        {currentInsight.message}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[var(--color-midnight-navy)]/20 group-hover:text-[var(--color-midnight-navy)]/60 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
