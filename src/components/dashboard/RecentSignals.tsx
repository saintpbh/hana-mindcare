"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Calendar, FileText, AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Signal {
    id: string;
    type: string;
    user: string;
    content: string;
    time: string;
}

interface RecentSignalsProps {
    clients: Signal[];
}

export function RecentSignals({ clients: signals }: RecentSignalsProps) {
    // Mapping helper
    const getIcon = (type: string) => {
        switch (type) {
            case 'log': return FileText;
            case 'reschedule': return Calendar;
            case 'message': return MessageSquare;
            case 'mood': return Heart;
            case 'homework': return CheckCircle2;
            default: return CheckCircle2;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'log': return "text-blue-500 bg-blue-50";
            case 'reschedule': return "text-amber-500 bg-amber-50";
            case 'message': return "text-purple-500 bg-purple-50";
            case 'mood': return "text-rose-500 bg-rose-50";
            case 'homework': return "text-emerald-500 bg-emerald-50";
            default: return "text-emerald-500 bg-emerald-50";
        }
    };

    const formattedSignals = signals.map(s => ({
        ...s,
        icon: getIcon(s.type),
        color: getColor(s.type)
    }));

    const router = useRouter();

    const handleSignalClick = (signal: Signal) => {
        switch (signal.type) {
            case 'log':
            case 'message':
                router.push(`/patients/${signal.id}?view=analysis`);
                break;
            case 'reschedule':
                router.push('/schedule');
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="font-semibold text-[var(--color-midnight-navy)]">최근 신호 (Recent Signals)</h3>
                <button className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">전체 보기</button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {formattedSignals.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-xs flex flex-col items-center justify-center h-full">
                        <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                        최근 활동이 없습니다.
                    </div>
                ) : (
                    formattedSignals.map((signal, index) => (
                        <div
                            key={`${signal.id}-${signal.time}-${index}`}
                            onClick={() => handleSignalClick(signal)}
                            className="flex gap-3 items-start group cursor-pointer p-2 rounded-xl hover:bg-[var(--color-midnight-navy)]/5 transition-colors"
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", signal.color)}>
                                <signal.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--color-midnight-navy)] leading-snug">
                                    <span className="font-semibold">{signal.user}</span>
                                    <span className="text-[var(--color-midnight-navy)]/80"> {signal.content.replace(`${signal.user} `, "")}</span>
                                </p>
                                <span className="text-xs text-[var(--color-midnight-navy)]/40 mt-1 block">{signal.time}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
