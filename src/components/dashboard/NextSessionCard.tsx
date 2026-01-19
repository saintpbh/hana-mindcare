"use client";

import { useEffect, useState } from "react";
import { Clock, Video, FileText, AlertCircle, ArrowRight, Calendar } from "lucide-react";
import { getNextSession } from "@/app/actions/appointments";
import Link from "next/link";

export function NextSessionCard() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNextSession().then(res => {
            if (res.success) {
                setSession(res.data);
            }
            setLoading(false);
        });
    }, []);

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
                <h3 className="text-xl font-bold text-white mb-2">No Upcoming Sessions</h3>
                <p className="text-white/60 text-sm max-w-[200px]">You have no scheduled sessions coming up nearby.</p>
                <Link href="/schedule" className="mt-6 px-6 py-2 bg-white text-[var(--color-midnight-navy)] rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors">
                    Check Schedule
                </Link>
            </div>
        );
    }

    const sessionDate = new Date(session.time);
    const timeDisplay = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffMin = Math.round((sessionDate.getTime() - new Date().getTime()) / 60000);
    const timeStatus = diffMin < 0 ? 'Started' : diffMin < 60 ? `Starts in ${diffMin}m` : `Starts at ${timeDisplay}`;

    return (
        <div className="relative overflow-hidden bg-[var(--color-midnight-navy)] text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/20">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm border border-white/10">
                                Up Next
                            </span>
                            <span className="text-xs text-indigo-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {timeStatus}
                            </span>
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-1">{session.clientName}</h3>
                        <p className="text-sm text-white/60">{session.condition} • Session {session.sessionNumber}/{session.totalSessions}</p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Key Signal - Mocked for now in action, but dynamic structurally */}
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-xs leading-relaxed text-white/80">
                            <span className="text-amber-400 font-bold block mb-0.5">{session.keySignal}</span>
                            {session.signalDetail}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white text-[var(--color-midnight-navy)] py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
                            Enter Session Room <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white">
                            <FileText className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
