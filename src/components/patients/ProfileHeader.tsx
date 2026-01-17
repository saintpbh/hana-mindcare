import { Shield, Sparkles, MessageCircle, Calendar, Send, Edit3 } from "lucide-react";
import { Client } from "@/data/mockClients";

interface ProfileHeaderProps {
    client: Client;
    onStartSession?: () => void;
    onPrescribe?: () => void;
    onSchedule?: () => void;
    onEdit?: () => void;
}

export function ProfileHeader({ client, onStartSession, onPrescribe, onSchedule, onEdit }: ProfileHeaderProps) {
    return (
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-champagne-gold)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-start gap-8">
                <div className="w-full flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex gap-6 items-center md:items-start">
                        <div className="w-24 h-24 rounded-2xl bg-[var(--color-midnight-navy)] text-white flex items-center justify-center text-3xl font-serif shrink-0">
                            {client.name.split('').length > 2 ? client.name.substring(1) : client.name}
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)] mb-1">
                                {client.name} <span className="text-lg text-[var(--color-midnight-navy)]/40 font-sans font-normal ml-2">{client.englishName}</span>
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-[var(--color-midnight-navy)]/60 mb-4">
                                <span>{client.age}세</span>
                                <span>•</span>
                                <span>{client.gender === "Female" ? "여성" : "남성"}</span>
                                <span>•</span>
                                <span>{client.contact}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)] text-xs font-medium border border-[var(--color-midnight-navy)]/5">
                                    {client.condition}
                                </span>
                                {client.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)] text-xs font-medium border border-[var(--color-midnight-navy)]/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md w-full md:w-auto">
                        <div className="p-4 rounded-xl bg-[var(--color-warm-white)] border border-[var(--color-midnight-navy)]/5">
                            <div className="flex items-center gap-2 mb-2 text-[var(--color-champagne-gold)]">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">AI 요약 (Summary)</span>
                            </div>
                            <p className="text-sm text-[var(--color-midnight-navy)] leading-relaxed line-clamp-3">
                                {client.notes}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="w-full pt-6 md:pt-0 border-t md:border-t-0 border-[var(--color-midnight-navy)]/5 flex flex-wrap gap-3">
                    <button
                        onClick={onStartSession}
                        className="h-10 px-4 rounded-lg bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        상담 시작
                    </button>
                    <button
                        onClick={onPrescribe}
                        className="h-10 px-4 rounded-lg bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] text-sm font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        처방하기
                    </button>
                    <button
                        onClick={onSchedule}
                        className="h-10 px-4 rounded-lg bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] text-sm font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        예약하기
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={onEdit}
                        className="h-10 px-4 rounded-lg text-[var(--color-midnight-navy)]/60 text-sm font-medium hover:bg-[var(--color-midnight-navy)]/5 hover:text-[var(--color-midnight-navy)] transition-colors flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        정보 수정
                    </button>
                </div>
            </div>
        </div>
    );
}
