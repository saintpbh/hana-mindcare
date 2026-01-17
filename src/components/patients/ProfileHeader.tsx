import { Shield, Sparkles, MessageCircle, Calendar, Send, Edit3, MessageSquare } from "lucide-react";
import { Client } from "@/data/mockClients";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
    client: Client;
    onStartSession?: () => void;
    onPrescribe?: () => void;
    onSchedule?: () => void;
    onEdit?: () => void;
    onMessage?: () => void;
}

export function ProfileHeader({ client, onStartSession, onPrescribe, onSchedule, onEdit, onMessage }: ProfileHeaderProps) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-champagne-gold)]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[var(--color-warm-white)] flex items-center justify-center">
                        <span className="text-4xl font-serif text-[var(--color-midnight-navy)]/20">{client.name[0]}</span>
                    </div>
                    <span className={cn(
                        "absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border-2 border-white",
                        client.status === "stable" ? "bg-emerald-500" :
                            client.status === "attention" ? "bg-amber-500" : "bg-rose-500"
                    )}>
                        {client.status === "stable" ? "안정" : client.status === "attention" ? "주의" : "위기"}
                    </span>
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-4 pt-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-serif text-[var(--color-midnight-navy)]">{client.name}</h1>
                            <span className="text-lg text-[var(--color-midnight-navy)]/40 font-light">{client.englishName}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-[var(--color-midnight-navy)]/60">
                            <span>{client.gender === "Female" ? "여성" : "남성"}, {client.age}세</span>
                            <span>•</span>
                            <span>{client.condition}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 py-4 border-y border-[var(--color-midnight-navy)]/5 w-full md:w-auto">
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Next Session</div>
                            <div className="font-medium text-[var(--color-midnight-navy)]">{client.nextSession}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Last Session</div>
                            <div className="font-medium text-[var(--color-midnight-navy)]">{client.lastSession}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Tags</div>
                            <div className="flex gap-1">
                                {client.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-[var(--color-midnight-navy)]/5 rounded text-xs text-[var(--color-midnight-navy)]/70">
                                        {tag}
                                    </span>
                                ))}
                                {client.tags.length > 2 && (
                                    <span className="px-2 py-0.5 bg-[var(--color-midnight-navy)]/5 rounded text-xs text-[var(--color-midnight-navy)]/70">
                                        +{client.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto min-w-[180px]">
                    <button
                        onClick={onStartSession}
                        className="w-full py-3 px-4 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-all shadow-md shadow-[var(--color-midnight-navy)]/20 flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        상담 시작 (Start)
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={onPrescribe}
                            className="py-3 px-4 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-col justify-center gap-1 text-sm"
                        >
                            <Send className="w-4 h-4 mb-0.5" />
                            처방하기
                        </button>
                        <button
                            onClick={onMessage}
                            className="py-3 px-4 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-col justify-center gap-1 text-sm"
                        >
                            <MessageSquare className="w-4 h-4 mb-0.5" />
                            문자전송
                        </button>
                        <button
                            onClick={onSchedule}
                            className="col-span-2 py-3 px-4 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            예약하기
                        </button>
                    </div>
                    <button
                        onClick={onEdit}
                        className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] flex items-center justify-center gap-1 mt-1 transition-colors"
                    >
                        <Edit3 className="w-3 h-3" />
                        정보 수정
                    </button>
                </div>
            </div>
        </div>
    );
}
