"use client";

import { NextAppointmentCard } from "@/components/mobile/NextAppointmentCard";
import { MoodLogger } from "@/components/mobile/MoodLogger";
import { PrescriptionBox } from "@/components/mobile/PrescriptionBox";
import { User, Bell } from "lucide-react";

export default function MySerenePage() {
    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] pb-20 max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Mobile Header */}
            <header className="p-6 flex justify-between items-center pt-8">
                <div>
                    <h1 className="text-xl font-serif text-[var(--color-midnight-navy)]">My Serene</h1>
                    <p className="text-sm text-[var(--color-midnight-navy)]/60">오늘의 마음, 안녕하신가요?</p>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--color-midnight-navy)] shadow-sm">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)] flex items-center justify-center text-white shadow-sm">
                        <span className="font-serif">M</span>
                    </div>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* 1. Next Appointment (D-Day) */}
                <section>
                    <NextAppointmentCard />
                </section>

                {/* 2. Mood Logger */}
                <section>
                    <MoodLogger />
                </section>

                {/* 3. Prescription Box */}
                <section>
                    <PrescriptionBox />
                </section>
            </main>

            {/* Bottom Nav Mock (Decorative) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-midnight-navy)]/5 p-4 flex justify-around text-[var(--color-midnight-navy)]/40 max-w-md mx-auto">
                <div className="w-12 h-1 bg-[var(--color-midnight-navy)]/20 rounded-full mx-auto" />
            </div>
        </div>
    );
}
