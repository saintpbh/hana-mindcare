"use client";

import { Calendar, Clock, MapPin, MessageCircle, MessageSquare, Phone, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ScheduleDetailPanelProps {
    appointment: any | null;
    onClose: () => void;
    onEdit: (id: number) => void;
}

export function ScheduleDetailPanel({ appointment, onClose, onEdit }: ScheduleDetailPanelProps) {
    if (!appointment) {
        return (
            <div className="w-80 bg-white border-l border-[var(--color-midnight-navy)]/5 flex flex-col items-center justify-center text-[var(--color-midnight-navy)]/40 p-6 text-center">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">선택된 상담이 없습니다.<br />일정을 클릭하여 상세 정보를 확인하세요.</p>
            </div>
        );
    }

    const isUpcoming = new Date(appointment.rawDate) > new Date();

    return (
        <div className="w-80 bg-white border-l border-[var(--color-midnight-navy)]/5 flex flex-col h-full shadow-xl shadow-[var(--color-midnight-navy)]/5 z-20">
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-midnight-navy)]/5 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full text-[var(--color-midnight-navy)]/40 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-1">
                    <div className="text-2xl font-serif font-bold text-[var(--color-midnight-navy)]">
                        {appointment.title}
                    </div>
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        appointment.color.replace("bg-", "bg-opacity-20 bg-").replace("border-", "border-opacity-0 ")
                    )}>
                        {appointment.type}
                    </span>
                </div>
                <div className="text-sm text-[var(--color-midnight-navy)]/60 font-medium">
                    내담자 ID: #{appointment.id.toString().slice(-4)}
                </div>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">

                    {/* Time & Place */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">일정 정보</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-[var(--color-midnight-navy)]">
                                        {format(new Date(appointment.rawDate), "M월 d일 (EEE)")}
                                    </div>
                                    <div className="text-sm text-[var(--color-midnight-navy)]/70">
                                        {Math.floor(appointment.time)}:{((appointment.time % 1) * 60).toString().padStart(2, '0')} - {Math.floor(appointment.time + appointment.duration)}:{(((appointment.time + appointment.duration) % 1) * 60).toString().padStart(2, '0')} (50분)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-[var(--color-midnight-navy)]">
                                        {appointment.location || "양재 센터"}
                                    </div>
                                    <div className="text-sm text-[var(--color-midnight-navy)]/70">
                                        상담실 302호
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onEdit(appointment.id)}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-midnight-navy)]/5 transition-all group"
                        >
                            <Calendar className="w-5 h-5 text-[var(--color-midnight-navy)]/60 group-hover:text-[var(--color-midnight-navy)]" />
                            <span className="text-xs font-bold text-[var(--color-midnight-navy)]/80">예약 변경</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-midnight-navy)]/10 hover:bg-[var(--color-midnight-navy)]/5 transition-all group">
                            <MessageSquare className="w-5 h-5 text-[var(--color-midnight-navy)]/60 group-hover:text-[var(--color-midnight-navy)]" />
                            <span className="text-xs font-bold text-[var(--color-midnight-navy)]/80">문자 전송</span>
                        </button>
                    </div>

                    {/* Check-in / Status */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">상담 상태</h3>
                        <div className="p-4 rounded-xl bg-[var(--color-warm-white)] border border-[var(--color-midnight-navy)]/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-[var(--color-midnight-navy)]">회기 진행률</span>
                                <span className="text-xs font-medium text-[var(--color-midnight-navy)]/60">12 / 20회</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--color-midnight-navy)]/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--color-midnight-navy)] w-[60%]" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--color-midnight-navy)]/5 flex gap-2">
                                <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">정서 안정</span>
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">수면 호전</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-[var(--color-midnight-navy)]/5 bg-[var(--color-warm-white)]/30">
                <button className="w-full py-3 rounded-xl bg-[var(--color-midnight-navy)] text-white text-sm font-bold hover:bg-[var(--color-midnight-navy)]/90 transition-shadow shadow-lg shadow-[var(--color-midnight-navy)]/20">
                    상담 시작하기 (Start Session)
                </button>
            </div>
        </div>
    );
}
