"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Calendar } from "lucide-react";

export function InsightVisualization({ clientId }: { clientId: string }) {
    // Mock data for trends
    const moodData = [
        { day: "M", value: 40 },
        { day: "T", value: 55 },
        { day: "W", value: 45 },
        { day: "T", value: 70 },
        { day: "F", value: 85 },
        { day: "S", value: 75 },
        { day: "S", value: 90 },
    ];

    const milestones = [
        { id: 1, title: "첫 번째 탐색", desc: "나의 감정을 솔직하게 마주하기 시작했어요", date: "2024.01.05", status: "completed" },
        { id: 2, title: "변화의 시작", desc: "부정적 자동 사고를 인지하기 시작했습니다", date: "2024.01.12", status: "completed" },
        { id: 3, title: "감정 조절의 습관", desc: "명상을 통해 평온을 찾는 루틴을 만들고 있어요", date: "2024.01.19", status: "current" },
        { id: 4, title: "회복 탄력성", desc: "어려운 상황에서도 스스로를 다독이는 힘", date: "Coming Soon", status: "upcoming" },
    ];

    return (
        <div className="space-y-8 pb-32">
            <header>
                <h3 className="text-xl font-serif text-[var(--color-midnight-navy)]">나의 성장 기록</h3>
                <p className="text-sm text-[var(--color-midnight-navy)]/40">한 주 동안 당신의 마음은 이만큼 자랐어요.</p>
            </header>

            {/* Weekly Sentiment Chart */}
            <section className="bg-white rounded-[32px] p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold text-[var(--color-midnight-navy)]">주간 안정도</span>
                    </div>
                    <span className="text-xs text-emerald-500 font-bold">+12% vs last week</span>
                </div>

                <div className="h-32 flex items-end justify-between gap-1 px-2">
                    {moodData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${d.value}%` }}
                                transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                                className="w-full max-w-[12px] rounded-full bg-gradient-to-t from-[var(--color-champagne-gold)]/20 to-[var(--color-champagne-gold)]"
                            />
                            <span className="text-[10px] text-gray-400 font-medium">{d.day}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Milestones */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Award className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                    <h4 className="text-sm font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">Growth Milestones</h4>
                </div>

                <div className="space-y-4">
                    {milestones.map((m, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={m.id}
                            className={`p-5 rounded-[24px] border transition-all ${m.status === 'completed' ? "bg-white border-emerald-100" :
                                    m.status === 'current' ? "bg-[var(--color-midnight-navy)] text-white border-transparent shadow-lg" :
                                        "bg-gray-50 border-gray-100 grayscale"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h5 className={`font-bold ${m.status === 'current' ? 'text-white' : 'text-[var(--color-midnight-navy)]'}`}>
                                    {m.title}
                                </h5>
                                <span className="text-[10px] opacity-40 font-mono italic">{m.date}</span>
                            </div>
                            <p className={`text-xs leading-relaxed ${m.status === 'current' ? 'text-white/70' : 'text-[var(--color-midnight-navy)]/50'}`}>
                                {m.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="p-8 rounded-[32px] bg-emerald-50 text-emerald-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 blur-xl" />
                <h4 className="text-lg font-serif mb-1 italic">"꾸준함이 변화를 만듭니다."</h4>
                <p className="text-xs opacity-80 leading-relaxed font-light">
                    벌써 4회기 연속으로 상담에 참여하셨어요. <br />스스로를 돌보려는 당신의 의지가 아름답습니다.
                </p>
            </div>
        </div>
    );
}
