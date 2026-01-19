import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import { NextAppointmentCard } from "@/components/mobile/NextAppointmentCard";
import { MoodLogger } from "@/components/mobile/MoodLogger";
import { PrescriptionBox } from "@/components/mobile/PrescriptionBox";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MobileClientPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            sessions: {
                where: { status: 'Scheduled' },
                orderBy: { date: 'asc' },
                take: 1
            }
        }
    });

    if (!client) {
        notFound();
    }

    const nextSession = client.sessions[0];

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] pb-20 max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Mobile Header */}
            <header className="p-6 flex justify-between items-center pt-8">
                <div>
                    <h1 className="text-xl font-serif text-[var(--color-midnight-navy)]">My Serene</h1>
                    <p className="text-sm text-[var(--color-midnight-navy)]/60">반가워요, {client.name}님.</p>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--color-midnight-navy)] shadow-sm">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-midnight-navy)] flex items-center justify-center text-white shadow-sm">
                        <span className="font-serif">{client.name[0]}</span>
                    </div>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* 1. Next Appointment */}
                <section>
                    <NextAppointmentCard appointment={nextSession} />
                </section>

                {/* 2. Mood Logger */}
                <section>
                    <MoodLogger clientId={client.id} />
                </section>

                {/* 3. Prescription Box */}
                <section>
                    <PrescriptionBox clientId={client.id} />
                </section>
            </main>

            {/* Bottom Nav Mock */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-midnight-navy)]/5 p-4 flex justify-around text-[var(--color-midnight-navy)]/40 max-w-md mx-auto">
                <div className="w-12 h-1 bg-[var(--color-midnight-navy)]/20 rounded-full mx-auto" />
            </div>
        </div>
    );
}
