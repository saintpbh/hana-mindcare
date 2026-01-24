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

    const formattedDate = format(new Date(appointment.rawDate), "M월 d일 (EEE)");

    // Format decimal time (e.g., 11.75 -> 11:45)
    const formatTime = (decimalTime: number) => {
        const hours = Math.floor(decimalTime);
        const minutes = Math.round((decimalTime % 1) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-96 bg-white border-l border-[var(--color-midnight-navy)]/5 flex flex-col h-full shadow-2xl shadow-[var(--color-midnight-navy)]/10 z-20 transition-transform">
            {/* Header */}
            <div className="p-8 pb-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl font-serif font-bold text-[var(--color-midnight-navy)]">
                        {appointment.title}
                    </div>
                    <span className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                        (appointment.color || "bg-gray-100 text-gray-800 border-gray-200").replace("bg-", "bg-opacity-20 bg-").replace("border-", "border-opacity-0 ")
                    )}>
                        {appointment.type}
                    </span>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    내담자 ID: #{appointment.clientId ? appointment.clientId.toString().slice(-4) : "NEW"}
                </div>
            </div>

            <div className="w-full h-px bg-gray-100 mx-auto w-[90%]" />

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-10">

                    {/* Time & Place */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">일정 정보</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-gray-50 text-[var(--color-midnight-navy)]">
                                    <Clock className="w-5 h-5 opacity-80" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-[var(--color-midnight-navy)] mb-0.5">
                                        {formattedDate}
                                    </div>
                                    <div className="text-base text-gray-500 font-medium font-mono">
                                        {formatTime(appointment.time)} ({appointment.duration * 60}분)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-gray-50 text-[var(--color-midnight-navy)]">
                                    {appointment.type.includes('비대면') ? <Video className="w-5 h-5 opacity-80" /> : <MapPin className="w-5 h-5 opacity-80" />}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-[var(--color-midnight-navy)] mb-0.5">
                                        {appointment.type.includes('비대면') ? '비대면 화상 상담' : (appointment.location || "양재 센터")}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                        {appointment.meetingLink ? (
                                            <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors">
                                                {appointment.meetingLink.includes('jit.si') ? 'Jitsi 회의 참가' : '회의 참가'} <Video className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            appointment.type.includes('비대면') ? '링크 없음' : '상담 센터'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onEdit(appointment.id)}
                            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group"
                        >
                            <Calendar className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-midnight-navy)] transition-colors" />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-[var(--color-midnight-navy)]">예약 변경</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group">
                            <MessageSquare className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-midnight-navy)] transition-colors" />
                            <span className="text-sm font-bold text-gray-500 group-hover:text-[var(--color-midnight-navy)]">문자 전송</span>
                        </button>
                    </div>

                    {/* Check-in / Status */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">상담 상태</h3>
                        <div className="p-6 rounded-2xl bg-gray-50 border border-transparent">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-base font-bold text-[var(--color-midnight-navy)]">회기 진행률</span>
                                <span className="text-sm font-semibold text-gray-500">12 / 20회</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-[var(--color-midnight-navy)] w-[60%] rounded-full" />
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">정서 안정</span>
                                <span className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold">수면 호전</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Action */}
            <div className="p-8 pt-4 bg-white border-t border-gray-100">
                {appointment.meetingLink ? (
                    <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 rounded-2xl bg-[var(--color-midnight-navy)] text-white text-base font-bold hover:bg-[#1a2b4b] transition-all shadow-lg hover:shadow-xl shadow-[var(--color-midnight-navy)]/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                        {appointment.meetingLink.includes('jit.si') ? 'Jitsi 상담 시작' : '화상 상담 시작'}
                        <Video className="w-5 h-5" />
                    </a>
                ) : (
                    <button className="w-full py-4 rounded-2xl bg-[var(--color-midnight-navy)] text-white text-base font-bold hover:bg-[#1a2b4b] transition-all shadow-lg hover:shadow-xl shadow-[var(--color-midnight-navy)]/20 transform hover:-translate-y-0.5">
                        상담 시작하기 (Start Session)
                    </button>
                )}
            </div>
        </div>
    );
}
