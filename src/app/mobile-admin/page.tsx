"use client";

import { useState } from "react";
import { Search, Menu, MessageSquare } from "lucide-react";
import { IncomingCallOverlay } from "@/components/mobile-admin/IncomingCallOverlay";
import { QuickClientProfile } from "@/components/mobile-admin/QuickClientProfile";
import { MobileSchedule } from "@/components/mobile-admin/MobileSchedule";

export default function MobileAdminPage() {
    const [view, setView] = useState<"dashboard" | "call" | "client">("dashboard");
    const [showCall, setShowCall] = useState(true); // Auto-trigger call for demo

    const handleCallAccept = () => {
        setShowCall(false);
        setView("client");
    };

    const handleCallDecline = () => {
        setShowCall(false);
        setView("dashboard");
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] pb-20 max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">

            {/* Header */}
            <header className="p-5 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[var(--color-midnight-navy)]/5">
                <span className="font-serif font-bold text-lg text-[var(--color-midnight-navy)]">Serene Admin</span>
                <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                    <Menu className="w-5 h-5 text-[var(--color-midnight-navy)]" />
                </button>
            </header>

            {/* Main Content */}
            <main className="p-5 space-y-6">

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-midnight-navy)]/40" />
                    <input
                        type="text"
                        placeholder="이름, 전화번호 검색"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)]"
                    />
                </div>

                {view === "client" && (
                    <section className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <QuickClientProfile />
                    </section>
                )}

                <section>
                    <MobileSchedule />
                </section>
            </main>

            {/* Overlay */}
            {showCall && (
                <IncomingCallOverlay
                    onAccept={handleCallAccept}
                    onDecline={handleCallDecline}
                />
            )}
        </div>
    );
}
