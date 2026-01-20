"use client";

import { useState, useEffect } from "react";
import { MobileNavBar } from "./MobileNavBar";
import { PremiumMoodTracker } from "./PremiumMoodTracker";
import { MessageInbox } from "./MessageInbox";
import { GrowthLibrary } from "./GrowthLibrary";
import { InsightVisualization } from "./InsightVisualization";
import { ZenSpace } from "./ZenSpace";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
    AlertTriangle,
    Phone,
    LifeBuoy,
    Heart,
    Sparkles,
    Wind,
    Bell,
    TrendingUp,
    ChevronRight,
    Play,
    Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getClientVideoStatus } from "@/app/actions/mobile";

type Tab = "home" | "insights" | "library" | "messages" | "profile";

export function MobileClientLayout({ client: initialClient, nextSession }: { client: any, nextSession: any }) {
    const [activeTab, setActiveTab] = useState<Tab>("home");
    const [isCrisisOpen, setIsCrisisOpen] = useState(false);
    const [greeting, setGreeting] = useState("반가워요");
    const [client, setClient] = useState(initialClient);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("좋은 아침이에요");
        else if (hour < 18) setGreeting("편안한 오후인가요?");
        else setGreeting("오늘 하루 고생 많았어요");
    }, []);

    // Optimized polling: only when page is visible, every 30 seconds
    useEffect(() => {
        let pollInterval: NodeJS.Timeout | null = null;

        const startPolling = () => {
            if (pollInterval) return; // Already polling

            pollInterval = setInterval(async () => {
                // Only poll if page is visible
                if (document.visibilityState === 'visible') {
                    const result = await getClientVideoStatus(client.id);
                    if (result.success && result.data) {
                        setClient((prev: any) => ({ ...prev, isVideoEnabled: (result.data as any)?.isVideoEnabled }));
                    }
                }
            }, 30000); // 30 seconds - much less server load
        };

        const stopPolling = () => {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        };

        // Start polling initially
        startPolling();

        // Listen for visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startPolling();
            } else {
                stopPolling();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [client.id]);

    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8 pb-32"
                    >
                        {/* Greeting & Header */}
                        <header className="pt-4 flex justify-between items-start">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 mb-1"
                                >
                                    <Sparkles className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                                    <span className="text-[10px] font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest">Premium Companion</span>
                                </motion.div>
                                <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)] leading-tight">
                                    {client.name}님, <br />{greeting}
                                </h2>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white border border-[var(--color-midnight-navy)]/5 flex items-center justify-center shadow-sm relative">
                                <Bell className="w-5 h-5 text-[var(--color-midnight-navy)]/40" />
                                <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>
                        </header>

                        {/* Next Session Card */}
                        {nextSession ? (
                            <section className="bg-[var(--color-midnight-navy)] rounded-[40px] p-7 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                            Upcoming Session
                                        </div>
                                        <span className="text-xs font-bold text-[var(--color-champagne-gold)]">D-DAY</span>
                                    </div>
                                    <div className="text-2xl font-bold mb-1">
                                        {(() => {
                                            const sessionDate = new Date(nextSession.date);
                                            const today = new Date();
                                            const tomorrow = new Date(today);
                                            tomorrow.setDate(today.getDate() + 1);

                                            const isTomorrow =
                                                sessionDate.getDate() === tomorrow.getDate() &&
                                                sessionDate.getMonth() === tomorrow.getMonth() &&
                                                sessionDate.getFullYear() === tomorrow.getFullYear();

                                            return (
                                                <>
                                                    {isTomorrow && <span className="text-[var(--color-champagne-gold)]">내일 </span>}
                                                    {format(sessionDate, "M월 d일 (EEE) p", { locale: ko })}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <p className="text-sm opacity-50 mb-8">{nextSession.location || "온라인 화상 상담"}</p>

                                    {/* Video Button Logic */}
                                    {client.isVideoEnabled ? (
                                        <a
                                            href={`https://meet.jit.si/HanaMindcare-${client.name}-${client.id.slice(0, 4)}#userInfo.displayName=${encodeURIComponent(client.name)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full"
                                        >
                                            <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl text-sm transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                                                <Video className="w-4 h-4" />
                                                화상 상담 입장하기 (Video)
                                            </button>
                                        </a>
                                    ) : (
                                        <button className="w-full py-4 bg-[var(--color-champagne-gold)] text-[var(--color-midnight-navy)] font-bold rounded-2xl text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-black/20">
                                            상담실 입장하기 (준비중)
                                        </button>
                                    )}
                                </div>
                            </section>
                        ) : (
                            <section className="bg-white rounded-[40px] p-8 text-center border border-[var(--color-midnight-navy)]/5 shadow-sm">
                                <div className="w-16 h-16 bg-[var(--color-warm-white)] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wind className="w-8 h-8 text-[var(--color-midnight-navy)]/20" />
                                </div>
                                <p className="text-sm text-[var(--color-midnight-navy)]/40 font-medium">
                                    {client.isVideoEnabled ? "예정된 상담이 없지만 화상실은 열려있습니다." : "예정된 상담 일정이 없습니다."}
                                </p>

                                {client.isVideoEnabled && (
                                    <a
                                        href={`https://meet.jit.si/HanaMindcare-${client.name}-${client.id.slice(0, 4)}#userInfo.displayName=${encodeURIComponent(client.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full mt-4"
                                    >
                                        <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-full text-sm transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                                            <Video className="w-4 h-4" />
                                            화상 상담실 입장
                                        </button>
                                    </a>
                                )}

                                {!client.isVideoEnabled && (
                                    <button className="mt-4 text-xs font-bold text-[var(--color-midnight-navy)] bg-[var(--color-warm-white)] px-4 py-2 rounded-full">일정 예약하기</button>
                                )}
                            </section>
                        )}

                        {/* Quick Insights Entry */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTab("library")}
                                className="bg-white p-6 rounded-[32px] border border-[var(--color-midnight-navy)]/5 shadow-sm flex flex-col items-start gap-4 active:scale-95 transition-transform"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Wind className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-1">Coping</div>
                                    <div className="text-sm font-bold">마음 챙김</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("insights")}
                                className="bg-white p-6 rounded-[32px] border border-[var(--color-midnight-navy)]/5 shadow-sm flex flex-col items-start gap-4 active:scale-95 transition-transform"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-1">Growth</div>
                                    <div className="text-sm font-bold">변화 확인</div>
                                </div>
                            </button>
                        </div>

                        {/* Mood Tracker */}
                        <section className="pb-8">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <h4 className="text-sm font-bold text-[var(--color-midnight-navy)] uppercase tracking-widest">Daily Mood</h4>
                                <span className="text-[10px] text-gray-400 font-medium">{format(new Date(), "yyyy.MM.dd")}</span>
                            </div>
                            <PremiumMoodTracker clientId={client.id} />
                        </section>

                        {/* Wisdom Card */}
                        <div className="p-8 rounded-[40px] bg-gradient-to-br from-[var(--color-midnight-navy)] to-[#1a2b4b] text-white relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--color-champagne-gold)]/20 rounded-full -mr-16 -mb-16 blur-2xl" />
                            <h4 className="text-lg font-serif mb-2 italic">오늘의 문장</h4>
                            <p className="text-sm opacity-70 leading-relaxed font-light italic">
                                "비바람이 지나간 뒤에야 비로소 맑은 하늘을 볼 수 있듯, 지금의 비바람 또한 지나갈 것입니다."
                            </p>
                        </div>
                    </motion.div>
                );
            case "insights":
                return <InsightVisualization clientId={client.id} />;
            case "library":
                return (
                    <div className="space-y-8 py-4">
                        <ZenSpace clientId={client.id} />
                        <GrowthLibrary clientId={client.id} />
                    </div>
                );
            case "messages":
                return <MessageInbox clientId={client.id} />;
            case "profile":
                return (
                    <div className="space-y-8 py-4">
                        <div className="flex items-center gap-6 p-6">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-midnight-navy)] text-white text-2xl flex items-center justify-center font-serif shadow-xl border-4 border-white">
                                {client.name[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{client.name}님</h3>
                                <p className="text-sm text-gray-400">{client.englishName || "Hana Member"}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-2 border border-[var(--color-midnight-navy)]/5 shadow-sm space-y-1">
                            {[
                                { label: "내 정보 관리", icon: User },
                                { label: "알림 설정", icon: Bell },
                                { label: "보안 및 개인정보", icon: LifeBuoy },
                                { label: "로그아웃", icon: AlertTriangle, color: "text-rose-500" },
                            ].map((item, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-[32px] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-[var(--color-warm-white)] flex items-center justify-center group-hover:bg-white transition-colors">
                                            <item.icon className={cn("w-5 h-5 opacity-40", item.color)} />
                                        </div>
                                        <span className={cn("text-sm font-bold", item.color)}>{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)] font-sans selection:bg-[var(--color-champagne-gold)]/30 overflow-x-hidden">
            <div className="max-w-md mx-auto px-6 min-h-screen relative">
                <main className="relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Crisis FAB */}
                <button
                    onClick={() => setIsCrisisOpen(true)}
                    className="fixed bottom-32 right-6 w-14 h-14 bg-rose-500 text-white rounded-full shadow-[0_8px_30px_rgb(244,63,94,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
                >
                    <AlertTriangle className="w-6 h-6" />
                </button>

                {/* Crisis Modal */}
                <AnimatePresence>
                    {isCrisisOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center p-4"
                            onClick={() => setIsCrisisOpen(false)}
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="bg-white w-full max-w-md rounded-[50px] p-10 space-y-8 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center space-y-3">
                                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LifeBuoy className="w-10 h-10 text-rose-500 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-serif text-[var(--color-midnight-navy)]">지금 마음이 많이 힘드신가요?</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed font-light">
                                        혼자 견디기 벅찬 순간인가요? <br />도움의 손길은 언제나 당신 가까이에 있습니다.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <a href="tel:1393" className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg shadow-rose-200">
                                        <Phone className="w-5 h-5" /> 자살예방 상담전화 (1393)
                                    </a>
                                    <button className="w-full py-5 bg-white text-[var(--color-midnight-navy)] rounded-[24px] font-bold border border-gray-100 shadow-sm flex items-center justify-center gap-3">
                                        <MessageInboxIcon className="w-5 h-5 opacity-40" /> 상담사에게 긴급 연락 남기기
                                    </button>
                                    <button
                                        onClick={() => setIsCrisisOpen(false)}
                                        className="w-full py-5 text-gray-400 text-sm font-medium hover:text-[var(--color-midnight-navy)] transition-colors"
                                    >
                                        나중에 다시 이야기할게요
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
}

// Internal Shorthand Icons if needed
function User(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function MessageInboxIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
