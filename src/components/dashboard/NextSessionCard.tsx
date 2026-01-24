"use client";

import { useEffect, useState } from "react";
import { Clock, Video, FileText, AlertCircle, ArrowRight, Calendar, MoreVertical, XCircle, Clock4, RotateCcw, Zap } from "lucide-react";
import { getNextSession, updateAppointmentStatus } from "@/app/actions/appointments";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NextSessionCardProps {
    refreshKey?: number;
    onReschedule?: (client: any) => void;
    onStatusChange?: () => void;
}

export function NextSessionCard({ refreshKey, onReschedule, onStatusChange }: NextSessionCardProps) {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const loadSession = () => {
        setLoading(true);
        getNextSession().then(res => {
            if (res.success) {
                setSession(res.data);
            } else {
                setSession(null);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        loadSession();
    }, [refreshKey]);

    const handleStatusUpdate = async (status: string) => {
        if (!session) return;
        const res = await updateAppointmentStatus(session.id, status);
        if (res.success) {
            setIsMenuOpen(false);
            if (onStatusChange) onStatusChange();
            else loadSession();
        }
    };

    if (loading) {
        return (
            <div className="relative overflow-hidden bg-[var(--color-midnight-navy)] text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/20 h-[300px] animate-pulse">
                <div className="h-full flex items-center justify-center text-white/20">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="relative overflow-hidden bg-[var(--color-midnight-navy)] text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/20 h-full min-h-[250px] flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">예정된 세션이 없습니다</h3>
                <p className="text-white/60 text-sm max-w-[200px]">현재 가까운 시간에 예정된 상담 일정이 없습니다.</p>
                <Link href="/schedule" className="mt-6 px-6 py-2 bg-white text-[var(--color-midnight-navy)] rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors">
                    전체 일정 확인
                </Link>
            </div>
        );
    }

    const sessionDate = new Date(session.time);
    const timeDisplay = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffMin = Math.round((sessionDate.getTime() - new Date().getTime()) / 60000);
    const timeStatus = diffMin < 0 ? '진행 중' : diffMin < 60 ? `${diffMin}분 후 시작` : `${timeDisplay} 시작`;

    return (
        <div className="relative overflow-hidden bg-[var(--color-midnight-navy)] text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/20 group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm border border-white/10 text-indigo-100">
                                UP NEXT
                            </span>
                            <span className="text-xs text-indigo-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {timeStatus}
                            </span>
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-1 leading-tight">{session.clientName}</h3>
                        <p className="text-sm text-white/60">
                            {session.condition} • Session {session.sessionNumber}{session.totalSessions ? `/${session.totalSessions}` : ''}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {session.meetingLink && (
                            <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md hover:bg-emerald-500/30 transition-colors group/link"
                                title="Join Meeting"
                            >
                                <Video className="w-5 h-5 text-emerald-400 group-hover/link:scale-110 transition-transform" />
                            </a>
                        )}
                        {!session.meetingLink && (
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                <Video className="w-5 h-5 text-white/40" />
                            </div>
                        )}
                        <div className="relative">

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5 text-white" />
                            </button>

                            {/* Quick Action Popover */}
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                if (onReschedule) onReschedule(session);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4 text-blue-500" />
                                            재일정 잡기
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Postponed')}
                                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                            <Clock4 className="w-4 h-4 text-amber-500" />
                                            세션 연기
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Canceled')}
                                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4 text-gray-500" />
                                            일정 취소
                                        </button>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button
                                            onClick={() => handleStatusUpdate('NoShow')}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            상담 취소 (노쇼)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Key Signal */}
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-xs leading-relaxed text-white/80">
                            <span className="text-amber-400 font-bold block mb-0.5">{session.keySignal}</span>
                            {session.signalDetail}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/patients/${session.clientId}?view=session`}
                            className="flex-1 bg-white/10 border border-white/20 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            세션 시작 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`/session/${session.clientId}?autoStart=true`}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
                            title="빠른 시작 - 즉시 녹음 시작"
                        >
                            <Zap className="w-4 h-4" /> 빠른 시작
                        </Link>
                        <button className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white">
                            <FileText className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
