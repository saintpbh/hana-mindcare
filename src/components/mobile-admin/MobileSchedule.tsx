"use client";

import { cn } from "@/lib/utils";
import { Clock, MapPin, ChevronRight, CalendarOff } from "lucide-react";
import { usePersistence } from "@/hooks/usePersistence";
import { Client } from "@/data/mockClients";

interface MobileScheduleProps {
    onSelectClient: (client: Client) => void;
}

export function MobileSchedule({ onSelectClient }: MobileScheduleProps) {
    const { clients, isLoaded } = usePersistence();

    // In a real app, we would have a separate 'appointments' collection.
    // For this MVP, we derive today's schedule from 'nextSession' properties of clients.
    // We'll simulate a mix of past and upcoming sessions for "Today" (which we'll assume is the date of the app)

    // Sort clients by nextSession to simulate a schedule list
    const scheduledClients = [...clients]
        .sort((a, b) => new Date(a.nextSession).getTime() - new Date(b.nextSession).getTime())
        .slice(0, 5); // Take top 5 for demo

    if (!isLoaded) return <div className="text-center p-4 opacity-50">로드 중...</div>;

    if (scheduledClients.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/40">
                <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">예정된 일정이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-[var(--color-midnight-navy)] px-1">예정된 일정 (Real Data)</h3>

            <div className="space-y-3">
                {scheduledClients.map((client, index) => {
                    // Mock times for visual variety based on index
                    const time = `${10 + (index * 2)}:00`;
                    const isPassed = index === 0; // First one is "completed"

                    return (
                        <div
                            key={client.id}
                            onClick={() => onSelectClient(client)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--color-midnight-navy)]/5 shadow-sm active:scale-[0.98] transition-all cursor-pointer",
                                isPassed && "opacity-60 bg-gray-50"
                            )}
                        >
                            <div className="text-center min-w-[3rem]">
                                <span className="block text-sm font-bold text-[var(--color-midnight-navy)]">{time}</span>
                                <span className="text-[10px] text-[var(--color-midnight-navy)]/40">50min</span>
                            </div>

                            <div className="w-px h-8 bg-[var(--color-midnight-navy)]/10" />

                            <div className="flex-1">
                                <h4 className="font-bold text-[var(--color-midnight-navy)] flex items-center gap-2">
                                    {client.name}
                                    {isPassed && (
                                        <span className="text-[10px] bg-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] px-1.5 py-0.5 rounded">완료</span>
                                    )}
                                </h4>
                                <span className="text-xs text-[var(--color-midnight-navy)]/60">{client.status}</span>
                            </div>

                            <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                                <ChevronRight className="w-5 h-5 text-[var(--color-midnight-navy)]/20" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
