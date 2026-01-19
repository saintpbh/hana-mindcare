"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { NextAppointmentCard } from "@/components/mobile/NextAppointmentCard";
import { PremiumMoodTracker } from "@/components/mobile/PremiumMoodTracker";
import { MessageInbox } from "@/components/mobile/MessageInbox";
import { GrowthLibrary } from "@/components/mobile/GrowthLibrary";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "home" | "messages" | "library" | "profile";

export function MobileClientLayout({ client, nextSession }: { client: any, nextSession: any }) {
    const [activeTab, setActiveTab] = useState<Tab>("home");
    const [greeting, setGreeting] = useState("반가워요");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("좋은 아침이에요");
        else if (hour < 18) setGreeting("행복한 오후예요");
        else setGreeting("편안한 밤 되세요");
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <section>
                            <NextAppointmentCard appointment={nextSession} />
                        </section>
                        <section>
                            <PremiumMoodTracker clientId={client.id} />
                        </section>
                        <div className="p-8 rounded-[32px] bg-[var(--color-midnight-navy)] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h4 className="text-lg font-serif mb-2">오늘의 응원</h4>
                            <p className="text-sm opacity-80 leading-relaxed font-light italic">
                                "당신의 마음이 머무는 곳에 평온이 깃들기를 바랍니다. 오늘 하루도 고생 많으셨어요."
                            </p>
                        </div>
                    </motion.div>
                );
            case "messages":
                return <MessageInbox clientId={client.id} />;
            case "library":
                return <GrowthLibrary clientId={client.id} />;
            case "profile":
                return (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-[var(--color-midnight-navy)] text-white text-3xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-white">
                            {client.name[0]}
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif text-[var(--color-midnight-navy)]">{client.name}님</h3>
                            <p className="text-sm text-[var(--color-midnight-navy)]/40">{client.englishName || "Serene Member"}</p>
                        </div>
                        <div className="pt-8 grid grid-cols-1 gap-2 px-4 text-left">
                            <div className="p-4 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 text-sm">
                                <span className="text-gray-400 block mb-1">진행중인 상담</span>
                                <span className="font-bold">{client.condition} 케어</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] pb-32 max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
            {/* Background Textures */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[var(--color-champagne-gold)]/5 to-transparent pointer-events-none" />

            <header className="p-6 flex justify-between items-center pt-8 sticky top-0 bg-[var(--color-warm-white)]/60 backdrop-blur-md z-40">
                <div>
                    <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)] flex items-center gap-2">
                        Hana <span className="text-[var(--color-champagne-gold)] text-sm font-bold uppercase tracking-widest bg-[var(--color-midnight-navy)] px-2 py-0.5 rounded-full">Companion</span>
                    </h1>
                    <p className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mt-1">
                        {greeting}, {client.name}님
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--color-midnight-navy)] shadow-sm border border-[var(--color-midnight-navy)]/5">
                        <Bell className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </main>

            <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
