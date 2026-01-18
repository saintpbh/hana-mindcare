"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Calendar, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RecentSignals() {
    const SIGNALS = [
        {
            id: 1,
            type: "log",
            user: "김민준",
            content: "기분 일지를 작성했습니다: '불안함이 조금 가라앉았다.'",
            time: "10분 전",
            icon: FileText,
            color: "text-blue-500 bg-blue-50"
        },
        {
            id: 2,
            type: "reschedule",
            user: "박지은",
            content: "다음 주 예약 일정을 변경 요청했습니다.",
            time: "1시간 전",
            icon: Calendar,
            color: "text-amber-500 bg-amber-50"
        },
        {
            id: 3,
            type: "message",
            user: "이서연",
            content: "문의 남김: '혹시 다음 세션을 줌으로 변경 가능할까요?'",
            time: "2시간 전",
            icon: MessageSquare,
            color: "text-purple-500 bg-purple-50"
        },
        {
            id: 4,
            type: "system",
            user: "System",
            content: "최현수 님의 처방(명상 가이드) 확인이 완료되었습니다.",
            time: "3시간 전",
            icon: CheckCircle2,
            color: "text-emerald-500 bg-emerald-50"
        }
    ];

    const router = useRouter();

    const handleSignalClick = (signal: typeof SIGNALS[0]) => {
        switch (signal.type) {
            case 'log':
            case 'message':
                router.push(`/patients/${signal.id}?view=analysis`);
                break;
            case 'reschedule':
                router.push('/schedule');
                break;
            case 'system':
                // Prepare for future implementation or go to library/notifications
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[var(--color-midnight-navy)]">최근 신호 (Recent Signals)</h3>
                <button className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">전체 보기</button>
            </div>

            <div className="space-y-4">
                {SIGNALS.map((signal) => (
                    <div
                        key={signal.id}
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
                ))}
            </div>
        </div>
    );
}
