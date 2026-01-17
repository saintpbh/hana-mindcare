"use client";

import { Calendar, Clock, FileText, Phone, MoreVertical, Search } from "lucide-react";

export function QuickClientProfile() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-warm-white)] flex items-center justify-center border-2 border-white shadow-sm text-2xl font-serif text-[var(--color-midnight-navy)]">
                        김
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-midnight-navy)]">김민준</h2>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-xs font-bold mt-1">
                            Crisis : 수면 장애
                        </span>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                    <MoreVertical className="w-5 h-5 text-[var(--color-midnight-navy)]/40" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[var(--color-warm-white)]/50 p-3 rounded-xl border border-[var(--color-midnight-navy)]/5">
                    <span className="text-xs text-[var(--color-midnight-navy)]/40 block mb-1">최근 상담</span>
                    <span className="font-medium text-[var(--color-midnight-navy)]">10월 22일 (화)</span>
                </div>
                <div className="bg-[var(--color-warm-white)]/50 p-3 rounded-xl border border-[var(--color-midnight-navy)]/5">
                    <span className="text-xs text-[var(--color-midnight-navy)]/40 block mb-1">다음 예약</span>
                    <span className="font-medium text-[var(--color-midnight-navy)]">10월 29일 (화)</span>
                </div>
            </div>

            <div className="space-y-2">
                <button className="w-full py-3 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20">
                    <Calendar className="w-4 h-4" />
                    일정 변경 (Reschedule)
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        간편 메모
                    </button>
                    <button className="py-3 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        통화 기록
                    </button>
                </div>
            </div>
        </div>
    );
}
