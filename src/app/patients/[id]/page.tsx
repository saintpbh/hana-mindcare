"use client";

import Link from "next/link";
import { ArrowLeft, Clock, FileText, AlertCircle, Trash2 } from "lucide-react";
import { ProfileHeader } from "@/components/patients/ProfileHeader";
import { MoodCalendar } from "@/components/patients/MoodCalendar";
import { useParams, useRouter } from "next/navigation";
import { PrescriptionModal } from "@/components/library/PrescriptionModal";
import { EditClientModal } from "@/components/patients/EditClientModal";
import { MessageModal } from "@/components/patients/MessageModal";
import { ScheduleModal } from "@/components/patients/ScheduleModal";
import { MobileAccessControl } from "@/components/patients/MobileAccessControl";
import { getClientWithHistory, updateClient, terminateClient, deleteQuickNote, restoreQuickNote } from "@/app/actions/clients";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/contexts/ConfirmContext";
// import { type Client, type Session } from "@prisma/client";
type Client = any;
type Session = any;

// Extended type to include sessions and quickNotes
type ClientWithSessions = Client & {
    sessions: Session[];
    quickNotes: { id: string; content: string; createdAt: Date }[];
};


export const dynamic = 'force-dynamic';

export default function PatientPage() {
    const params = useParams();
    const router = useRouter();
    const { confirm } = useConfirm();
    const [client, setClient] = useState<ClientWithSessions | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isTerminateOpen, setIsTerminateOpen] = useState(false);

    useEffect(() => {
        const fetchClient = async () => {
            if (typeof params.id === 'string') {
                console.log("Fetching client with param ID:", params.id);
                const result = await getClientWithHistory(params.id);
                console.log("Fetch result:", result);

                if (result.success && result.data) {
                    setClient(result.data as ClientWithSessions);
                } else {
                    console.error("Failed to load client data");
                }
                setIsLoaded(true);
            }
        };
        fetchClient();
    }, [params.id]);

    const handleSaveProfile = async (updatedClient: Client) => {
        console.log('🔵 handleSaveProfile called with:', updatedClient);
        if (!client) {
            console.log('❌ No client, returning');
            return;
        }

        console.log('🔵 Calling updateClient with id:', client.id);
        const result = await updateClient(client.id, updatedClient);
        console.log('🔵 updateClient result:', result);

        if (result.success && result.data) {
            console.log('✅ Update successful, updating local state');
            // Re-fetch to get consistent state or just update local
            setClient((prev: any) => prev ? { ...prev, ...result.data } : null);
            setIsEditOpen(false);
        } else {
            console.error('❌ Update failed:', result.error);
            alert(`수정 실패: ${result.error || '알 수 없는 오류'}`);
        }
    };

    const handleStartSession = () => {
        router.push(`/session/${params.id}`);
    };

    const handleSchedule = () => {
        setIsScheduleOpen(true);
    };

    const handleTerminate = () => {
        setIsTerminateOpen(true);
    };

    const handleConfirmTerminate = async () => {
        if (!client) return;

        const result = await terminateClient(client.id);
        if (result.success) {
            // Refresh client data
            setClient((prev: any) => prev ? { ...prev, status: 'terminated' } : null);
            setIsTerminateOpen(false);
        } else {
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    const handleCareMessage = () => {
        if (!client) return;
        const msg = `[Hana Mindcare Care]\n안녕하세요, ${client.name}님. 잘 지내고 계신가요?\n요즘 컨디션은 어떠신지 궁금하여 연락드립니다.`;
        // In real app, open modal with this text pre-filled
        alert(`[안부 문자 발송 시뮬레이션]\n\n받는 사람: ${client.name}\n내용:\n${msg}`);
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-[var(--color-warm-white)]" />;
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-[var(--color-warm-white)] p-8 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-[var(--color-midnight-navy)]/20 mx-auto mb-4" />
                    <h2 className="text-xl font-serif text-[var(--color-midnight-navy)] mb-2">내담자를 찾을 수 없습니다.</h2>
                    <Link href="/patients" className="text-sm font-medium text-[var(--color-midnight-navy)] hover:underline">
                        내담자 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Navigation */}
                <Link href="/patients" className="inline-flex items-center gap-2 text-sm text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    내담자 목록으로 돌아가기
                </Link>

                <ProfileHeader
                    client={client}
                    onStartSession={handleStartSession}
                    onPrescribe={() => setIsPrescribeOpen(true)}
                    onSchedule={handleSchedule}
                    onEdit={() => setIsEditOpen(true)}
                    onMessage={() => setIsMessageOpen(true)}
                    onTerminate={handleTerminate}
                    onCareMessage={handleCareMessage}
                />


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Mood & Stats */}
                    <div className="space-y-8">
                        <MoodCalendar clientId={client.id} />

                        <div className="bg-white rounded-2xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                            <h3 className="font-semibold text-[var(--color-midnight-navy)] mb-4">참여 통계 (Engagement)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">총 세션 횟수</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">
                                        {client.sessions?.length || 0}회
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">결석 (No-show)</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">0회</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">평균 세션 시간</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">50분</span>
                                </div>
                            </div>
                        </div>

                        <MobileAccessControl
                            client={client}
                            onMessageClick={() => setIsMessageOpen(true)}
                            onUpdate={(updated) => setClient((prev: any) => prev ? { ...prev, ...updated } : null)}
                        />
                    </div>

                    {/* Right: Session History & Notes */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-[var(--color-midnight-navy)] text-lg">최근 세션 기록 (History)</h3>

                            {(!client.sessions || client.sessions.length === 0) ? (
                                <div className="text-center py-10 text-gray-500">기록된 세션이 없습니다.</div>
                            ) : (
                                <>
                                    {client.sessions.slice(0, isHistoryExpanded ? undefined : 4).map((session: any) => (
                                        <Link key={session.id} href={`/patients/${client.id}/sessions/${session.id}`} className="block group">
                                            <div className="bg-white p-5 rounded-xl border border-[var(--color-midnight-navy)]/5 shadow-sm hover:border-[var(--color-champagne-gold)]/30 transition-colors cursor-pointer mb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-[var(--color-midnight-navy)] group-hover:text-[var(--color-champagne-gold)] transition-colors">
                                                            {session.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/40 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{new Date(session.date).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span>{session.sentiment}</span>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 bg-[var(--color-warm-white)] rounded text-[10px] font-medium text-[var(--color-midnight-navy)]/60 uppercase">
                                                        분석 완료
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--color-midnight-navy)]/70 line-clamp-2">
                                                    {session.summary}
                                                </p>
                                                <div className="mt-4 flex gap-2">
                                                    <div className="text-xs flex items-center gap-1 font-medium text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)]">
                                                        <FileText className="w-3 h-3" />
                                                        상담 노트 보기
                                                    </div>
                                                    <div className="flex gap-1 ml-auto">
                                                        {session.keywords.map((k: string) => (
                                                            <span key={k} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">#{k}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {client.sessions.length > 4 && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                                className="px-4 py-2 text-sm font-medium text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] bg-white border border-[var(--color-midnight-navy)]/10 rounded-lg hover:bg-[var(--color-midnight-navy)]/5 transition-colors"
                                            >
                                                {isHistoryExpanded ? "접기" : `전체 보기 (${client.sessions.length})`}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Quick Notes Section */}
                        <div className="pt-4 border-t border-[var(--color-midnight-navy)]/5">
                            <h3 className="font-semibold text-[var(--color-midnight-navy)] text-lg mb-4 flex items-center gap-2">
                                수시 메모 (Quick Notes)
                                <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Mobile Sync</span>
                            </h3>
                            {(!client.quickNotes || client.quickNotes.length === 0) ? (
                                <div className="text-center py-4 text-gray-400 text-sm italic">저장된 메모가 없습니다.</div>
                            ) : (
                                <div className="space-y-3">
                                    {client.quickNotes.map((note: any) => (
                                        <div key={note.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100 relative group">
                                            <p className="text-sm text-amber-900/90 whitespace-pre-wrap leading-relaxed pr-6">{note.content}</p>
                                            <span className="text-xs text-amber-800/50 mt-2 block flex justify-between">
                                                <span>{new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    if (await confirm('메모를 삭제하시겠습니까?')) {
                                                        const res = await deleteQuickNote(note.id);
                                                        if (res.success) {
                                                            // Refresh local state if needed or rely on re-fetch
                                                            setClient((prev: any) => prev ? {
                                                                ...prev,
                                                                quickNotes: prev.quickNotes.filter((n: any) => n.id !== note.id)
                                                            } : null);

                                                            if (await confirm('삭제되었습니다. 되살리시겠습니까? (Undo)', {
                                                                title: "실행 취소",
                                                                confirmText: "되살리기",
                                                                variant: "default"
                                                            })) {
                                                                const restoreRes = await restoreQuickNote(note.id);
                                                                if (restoreRes.success) {
                                                                    // Optimistically add back if we have full object, but simpler to reload
                                                                    const result = await getClientWithHistory(client.id);
                                                                    if (result.success && result.data) setClient(result.data as ClientWithSessions);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                                className="absolute top-4 right-4 text-amber-800/20 hover:text-rose-500 transition-colors hidden group-hover:block"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <PrescriptionModal
                isOpen={isPrescribeOpen}
                onClose={() => setIsPrescribeOpen(false)}
                resourceTitle="추천 콘텐츠"
                clientId={client.id}
            />

            <EditClientModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSaveProfile}
                client={client}
            />

            <MessageModal
                isOpen={isMessageOpen}
                onClose={() => setIsMessageOpen(false)}
                clients={client ? [client] : []}
            />

            <ScheduleModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                client={client}
            />

            {/* Terminate Confirmation Modal */}
            <Dialog open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="mb-4">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <DialogTitle className="text-2xl font-serif text-[var(--color-midnight-navy)] text-center">
                            상담을 종결하시겠습니까?
                        </DialogTitle>
                        <DialogDescription className="text-center text-[var(--color-midnight-navy)]/60 pt-2 leading-relaxed">
                            <strong className="text-[var(--color-midnight-navy)]">{client.name}</strong>님의 모든 상담 과정이 종료됩니다.<br />
                            종결된 상담은 별도 목록에서 관리됩니다.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex gap-3 mt-4 sm:justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => setIsTerminateOpen(false)}
                            className="flex-1 h-12 rounded-xl text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] hover:bg-[var(--color-warm-white)] font-medium"
                        >
                            돌아가기
                        </Button>
                        <Button
                            onClick={handleConfirmTerminate}
                            className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-200"
                        >
                            종결하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
