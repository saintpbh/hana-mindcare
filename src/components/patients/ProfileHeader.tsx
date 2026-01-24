import { Shield, Sparkles, MessageCircle, Calendar, Send, Edit3, MessageSquare, Video, Copy } from "lucide-react";
// import { type Client } from "@prisma/client";
type Client = any;
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LinkCopyModal } from "@/components/common/LinkCopyModal";

interface ProfileHeaderProps {
    client: Client;
    onStartSession?: () => void;
    onPrescribe?: () => void;
    onSchedule?: () => void;
    onEdit?: () => void;
    onMessage?: () => void;
    onTerminate?: () => void;
    onCareMessage?: () => void;
    onPayment?: () => void; // New
}

export function ProfileHeader({ client, onStartSession, onPrescribe, onSchedule, onEdit, onMessage, onTerminate, onCareMessage, onPayment }: ProfileHeaderProps) {
    const isTerminated = client.status === 'terminated';
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-3xl p-8 border border-[var(--color-midnight-navy)]/5 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br rounded-bl-full -mr-16 -mt-16 pointer-events-none ${isTerminated ? "from-gray-200/50" : "from-[var(--color-champagne-gold)]/10"}`} />

            <div className="relative flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center ${isTerminated ? "bg-gray-100 grayscale opacity-80" : "bg-[var(--color-warm-white)]"}`}>
                        <span className="text-4xl font-serif text-[var(--color-midnight-navy)]/20">{client.name[0]}</span>
                    </div>
                    <span className={cn(
                        "absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border-2 border-white",
                        client.status === "stable" ? "bg-emerald-500" :
                            client.status === "attention" ? "bg-amber-500" :
                                client.status === "crisis" ? "bg-rose-500" :
                                    "bg-gray-500" // terminated
                    )}>
                        {client.status === "stable" ? "안정" :
                            client.status === "attention" ? "주의" :
                                client.status === "crisis" ? "위기" : "종결"}
                    </span>
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-4 pt-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className={cn("text-3xl font-serif", isTerminated ? "text-gray-500" : "text-[var(--color-midnight-navy)]")}>
                                {client.name}
                            </h1>
                            <span className="text-lg text-[var(--color-midnight-navy)]/40 font-light">{client.englishName}</span>
                            {isTerminated && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200">
                                    상담 종결됨
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-midnight-navy)]/60">
                            <span>{client.gender === "Female" ? "여성" : "남성"}, {client.age}세</span>
                            <span>•</span>
                            <span>{client.condition}</span>
                            {!isTerminated && (client as any).isPortalActive && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Hana Companion 활성
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 py-4 border-y border-[var(--color-midnight-navy)]/5 w-full md:w-auto">
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Next Session</div>
                            <div className="font-medium text-[var(--color-midnight-navy)]">
                                {isTerminated ? "-" : client.nextSession}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Last Session</div>
                            <div className="font-medium text-[var(--color-midnight-navy)]">{client.lastSession}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 uppercase tracking-wider mb-1">Tags</div>
                            <div className="flex gap-1">
                                {client.tags.slice(0, 2).map((tag: string) => (
                                    <span key={tag} className="px-2 py-0.5 bg-[var(--color-midnight-navy)]/5 rounded text-xs text-[var(--color-midnight-navy)]/70">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full md:w-auto min-w-[180px]">
                    {!isTerminated ? (
                        <>
                            <button
                                onClick={onStartSession}
                                className="w-full py-3 px-4 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-all shadow-md shadow-[var(--color-midnight-navy)]/20 flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                상담 시작 (Start)
                            </button>

                            {/* Video Chat Button */}
                            {(() => {
                                // Find the nearest upcoming session with a meeting link
                                const futureSessions = client.sessions?.filter((s: any) => new Date(s.date) >= new Date() && s.meetingLink) || [];
                                const upcomingSession = futureSessions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                                const videoLink = upcomingSession?.meetingLink || `https://meet.jit.si/HanaMindcare-${client.name}-${client.id.slice(0, 4)}`;
                                const isScheduled = !!upcomingSession?.meetingLink;

                                const handleCopyLink = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(videoLink);
                                    setCopiedLink(videoLink);
                                };

                                return (
                                    <>
                                        <div className="flex gap-2 w-full">
                                            <a
                                                href={videoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2",
                                                    isScheduled
                                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20"
                                                        : "bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/5"
                                                )}
                                            >
                                                <Video className={cn("w-4 h-4", isScheduled ? "text-white" : "text-emerald-600")} />
                                                {isScheduled ? "화상 입장" : "화상 회의"}
                                            </a>
                                            <button
                                                onClick={handleCopyLink}
                                                title="링크 복사 (카카오톡 발송용)"
                                                className="px-3 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-white text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center justify-center"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <LinkCopyModal
                                            isOpen={!!copiedLink}
                                            onClose={() => setCopiedLink(null)}
                                            link={copiedLink || ""}
                                            description={`화상 상담 링크가 복사되었습니다.\n카카오톡 등에 붙여넣기(Ctrl+V) 하세요.`}
                                        />
                                    </>
                                );
                            })()}

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
                                {onPayment && (
                                    <button
                                        onClick={onPayment}
                                        className="col-span-2 py-3 px-4 bg-[var(--color-midnight-navy)]/5 border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium hover:bg-[var(--color-midnight-navy)]/10 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <div className="w-4 h-4 flex items-center justify-center font-serif font-bold">$</div>
                                        결제 및 정산
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Terminated Actions (Care Management) */
                        <>
                            <div className="p-3 bg-[var(--color-warm-white)] rounded-xl border border-[var(--color-midnight-navy)]/5 text-center">
                                <div className="text-xs text-[var(--color-midnight-navy)]/60 mb-2">Care Management</div>
                                <button
                                    onClick={onCareMessage}
                                    className="w-full py-2 px-3 bg-[#FAE300] text-[#3b1e1e] rounded-lg font-bold hover:bg-[#FCE600]/90 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    안부 문자 보내기
                                </button>
                            </div>
                        </>
                    )}

                    <div className="flex justify-center gap-4 mt-1">
                        <button
                            onClick={onEdit}
                            className="text-xs text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] flex items-center justify-center gap-1 transition-colors"
                        >
                            <Edit3 className="w-3 h-3" />
                            정보 수정
                        </button>
                        {!isTerminated && (
                            <button
                                onClick={onTerminate}
                                className="text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1 transition-colors"
                            >
                                <Shield className="w-3 h-3" />
                                상담 종결
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
