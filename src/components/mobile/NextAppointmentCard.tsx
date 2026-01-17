"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

export function NextAppointmentCard() {
    // Mock data for demo
    const appointment = {
        dDay: "D-3",
        date: "10월 24일 (목)",
        time: "오후 2:00",
        type: "정기 상담",
        location: "하나 마인드케어 센터",
        message: "거의 다 왔어요! 3일 뒤에 만나요, 민준님."
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-champagne-gold)]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[var(--color-midnight-navy)] text-white text-xs font-bold rounded-full">
                    {appointment.type}
                </span>
                <span className="text-2xl font-bold text-[var(--color-champagne-gold)] font-serif">
                    {appointment.dDay}
                </span>
            </div>

            <h3 className="text-xl font-bold text-[var(--color-midnight-navy)] mb-1">
                {appointment.date}
            </h3>
            <div className="flex items-center gap-1 text-[var(--color-midnight-navy)]/60 mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{appointment.time}</span>
            </div>

            <p className="text-sm text-[var(--color-midnight-navy)]/80 leading-relaxed mb-4 font-medium">
                "{appointment.message}"
            </p>

            <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/40 bg-[var(--color-warm-white)] p-3 rounded-xl">
                <MapPin className="w-3.5 h-3.5" />
                {appointment.location}
            </div>
        </div>
    );
}
