"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

export function NextAppointmentCard({ appointment }: { appointment?: any }) {
    if (!appointment) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 text-center py-12">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-[var(--color-midnight-navy)]/40 text-sm">예정된 일정이 없습니다.</p>
            </div>
        );
    }

    const date = new Date(appointment.date);
    const dateStr = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const timeStr = date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Calculate D-Day
    const diff = date.getTime() - new Date().getTime();
    const dDayNum = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const dDay = dDayNum === 0 ? "D-Day" : dDayNum > 0 ? `D-${dDayNum}` : `Passed`;

    const message = dDayNum === 0 ? "오늘 상담이 있는 날이에요!" : `${dDayNum}일 뒤에 만나게 되어서 기뻐요.`;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-champagne-gold)]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[var(--color-midnight-navy)] text-white text-xs font-bold rounded-full">
                    {appointment.type}
                </span>
                <span className="text-2xl font-bold text-[var(--color-champagne-gold)] font-serif">
                    {dDay}
                </span>
            </div>

            <h3 className="text-xl font-bold text-[var(--color-midnight-navy)] mb-1">
                {dateStr}
            </h3>
            <div className="flex items-center gap-1 text-[var(--color-midnight-navy)]/60 mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{timeStr}</span>
            </div>

            <p className="text-sm text-[var(--color-midnight-navy)]/80 leading-relaxed mb-4 font-medium">
                "{message}"
            </p>

            <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/40 bg-[var(--color-warm-white)] p-3 rounded-xl">
                <MapPin className="w-3.5 h-3.5" />
                {appointment.location || "하나 마인드케어 센터"}
            </div>
        </div>
    );
}
