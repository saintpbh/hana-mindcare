"use client";

import { IntelligentBriefing } from "@/components/dashboard/IntelligentBriefing";
import { SmartCalendar } from "@/components/calendar/SmartCalendar";
import { RecentSignals } from "@/components/dashboard/RecentSignals";
import { QuickNote } from "@/components/dashboard/QuickNote";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { BarChart, Users, CalendarCheck, AlertTriangle } from "lucide-react";

import { SessionConclusionModal } from "@/components/session/SessionConclusionModal";
import { ScheduleModal } from "@/components/patients/ScheduleModal";
import { useState } from "react";

import { IntakeQueueWidget } from "@/components/dashboard/IntakeQueueWidget";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";

export function DashboardPage({ data, recentNotes, clients }: { data: any, recentNotes: any[], clients: any[] }) {
    const { role } = useUserRole();
    const [isConclusionModalOpen, setIsConclusionModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleClient, setScheduleClient] = useState<any>(null);

    return (
        <div className="flex min-h-screen bg-[var(--color-warm-white)] flex-col lg:flex-row">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-4 lg:p-10 overflow-auto">
                    <div className="max-w-7xl mx-auto">

                        {/* Session Conclusion Modal Integration */}
                        <SessionConclusionModal
                            isOpen={isConclusionModalOpen}
                            onClose={() => setIsConclusionModalOpen(false)}
                            clientName="박지은"
                            onWriteReport={() => {
                                alert("Navigating to Report Page...");
                                setIsConclusionModalOpen(false);
                            }}
                            onScheduleNext={() => {
                                setIsConclusionModalOpen(false);
                                // Demo: Find client named "박지은" or fallback to first
                                const targetClient = clients.find(c => c.name === "박지은") || clients[0];
                                if (targetClient) {
                                    setScheduleClient(targetClient);
                                    setIsScheduleModalOpen(true);
                                }
                            }}
                            onDownloadTranscript={() => {
                                alert("Downloading Transcript...");
                                setIsConclusionModalOpen(false);
                            }}
                        />

                        {/* Schedule Modal */}
                        {isScheduleModalOpen && (
                            <ScheduleModal
                                isOpen={isScheduleModalOpen}
                                onClose={() => setIsScheduleModalOpen(false)}
                                client={scheduleClient}
                            />
                        )}

                        {/* Admin View: Stat Cards Row */}
                        {role === 'admin' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 animate-in fade-in slide-in-from-top-4">
                                <AdminStatCard
                                    icon={Users} label="전체 내담자" value="124" trend="+3 this week"
                                    color="text-blue-600" bg="bg-blue-50" border="border-blue-100"
                                />
                                <AdminStatCard
                                    icon={CalendarCheck} label="이번주 예약" value="48" trend="92% filled"
                                    color="text-teal-600" bg="bg-teal-50" border="border-teal-100"
                                />
                                <AdminStatCard
                                    icon={AlertTriangle} label="위기/주의" value="3" trend="Needs action"
                                    color="text-amber-600" bg="bg-amber-50" border="border-amber-100"
                                    isAlert
                                />
                                <AdminStatCard
                                    icon={BarChart} label="센터 가동률" value="87%" trend="+5% vs last mo"
                                    color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                            {/* Left Column (Main Content) */}
                            <div className={cn("space-y-6 lg:space-y-8 transition-all min-w-0", role === 'admin' ? "lg:col-span-5 order-2" : "lg:col-span-8 order-1")}>

                                {/* Counselor View: Next Session Highlight */}
                                {(role === 'counselor' || role === 'solo') && (
                                    <div className="animate-in fade-in slide-in-from-left-4">
                                        <NextSessionCard />
                                    </div>
                                )}

                                {/* Admin View: Intake Queue */}
                                {role === 'admin' && (
                                    <div className="animate-in fade-in slide-in-from-right-4">
                                        <IntakeQueueWidget />
                                    </div>
                                )}

                                {/* Briefing Widget */}
                                <section className="relative">
                                    <IntelligentBriefing clients={data.briefing} />
                                    {(role !== 'admin') && (
                                        <button
                                            onClick={() => setIsConclusionModalOpen(true)}
                                            className="absolute top-4 right-4 text-xs bg-white border border-neutral-200 px-3 py-1.5 rounded-full hover:bg-neutral-50 shadow-sm text-neutral-500 font-medium z-10"
                                        >
                                            Demo: End Session
                                        </button>
                                    )}
                                </section>

                                {/* Recent Signals & Notes */}
                                {(role !== 'admin') ? (
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-12">
                                            <RecentSignals clients={data.signals} />
                                        </div>
                                        <div className="md:col-span-12">
                                            <QuickNote initialNotes={recentNotes} clients={clients} />
                                        </div>
                                    </div>
                                ) : (
                                    /* Admin sees specific lists */
                                    <div className="space-y-6">
                                        <RecentSignals clients={data.signals} />
                                    </div>
                                )}
                            </div>

                            {/* Right Column (Calendar/Schedule) */}
                            <div className={cn("transition-all min-w-0", role === 'admin' ? "lg:col-span-7 order-1" : "lg:col-span-4 order-2")}>
                                <section className="h-full sticky top-10">
                                    <SmartCalendar className="h-full" />
                                </section>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function AdminStatCard({ icon: Icon, label, value, trend, color, bg, border, isAlert }: any) {
    return (
        <div className={cn(
            "p-5 rounded-2xl shadow-sm border flex flex-col justify-between h-32 hover:scale-105 transition-all cursor-default bg-white",
            border,
            isAlert && "ring-2 ring-amber-100"
        )}>
            <div className="flex justify-between items-start">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium", bg, color)}>{trend}</span>
            </div>
            <div>
                <div className="text-2xl font-bold text-neutral-800 tracking-tight">{value}</div>
                <div className="text-xs text-neutral-400 font-medium mt-1">{label}</div>
            </div>
        </div>
    );
}
