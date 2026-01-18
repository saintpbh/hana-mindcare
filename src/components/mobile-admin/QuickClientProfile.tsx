import { useState } from "react";
import { Calendar, Clock, FileText, Phone, MoreVertical, Search, AlertCircle, Edit2 } from "lucide-react";
import { usePersistence } from "@/hooks/usePersistence";
import { Client } from "@/data/mockClients";
import { RescheduleModal } from "./RescheduleModal";
import { cn } from "@/lib/utils";

interface QuickClientProfileProps {
    client: Client;
}

export function QuickClientProfile({ client }: QuickClientProfileProps) {
    const { updateClient } = usePersistence();
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

    // const handleReschedule = () => {
    //     const newDate = window.prompt("변경할 예약 날짜를 입력하세요 (YYYY-MM-DD):", client.nextSession);
    //     if (newDate) {
    //         updateClient({ ...client, nextSession: newDate });
    //     }
    // };

    const handleAddNote = () => {
        const newNote = window.prompt("추가할 메모를 입력하세요:", "");
        if (newNote) {
            const updatedNotes = `${client.notes}\n[Mobile]: ${newNote}`;
            updateClient({ ...client, notes: updatedNotes });
        }
    };

    const isCrisis = client.status === "crisis";

    const handleCancelSession = () => {
        if (confirm("정말로 금일 상담을 취소하시겠습니까?\n(일정은 유지되지만 '취소됨'으로 표시됩니다.)")) {
            updateClient({ ...client, isSessionCanceled: true });
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-warm-white)] flex items-center justify-center border-2 border-white shadow-sm text-2xl font-serif text-[var(--color-midnight-navy)]">
                            {client.name.substring(0, 1)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[var(--color-midnight-navy)]">{client.name}</h2>
                                {client.isSessionCanceled && (
                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">취소됨</span>
                                )}
                            </div>

                            {isCrisis ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-xs font-bold mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Crisis : 주의 요망
                                </span>
                            ) : (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 text-xs font-bold mt-1">
                                    {client.status}
                                </span>
                            )}

                        </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-[var(--color-midnight-navy)]/5">
                        <MoreVertical className="w-5 h-5 text-[var(--color-midnight-navy)]/40" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[var(--color-warm-white)]/50 p-3 rounded-xl border border-[var(--color-midnight-navy)]/5">
                        <span className="text-xs text-[var(--color-midnight-navy)]/40 block mb-1">최근 상담</span>
                        <span className="font-medium text-[var(--color-midnight-navy)]">{client.lastSession}</span>
                    </div>
                    <div
                        onClick={() => setIsRescheduleOpen(true)}
                        className="bg-[var(--color-warm-white)]/50 p-3 rounded-xl border border-[var(--color-midnight-navy)]/5 active:bg-[var(--color-midnight-navy)]/5 cursor-pointer relative group"
                    >
                        <Edit2 className="w-3 h-3 absolute top-2 right-2 text-[var(--color-midnight-navy)]/20" />
                        <span className="text-xs text-[var(--color-midnight-navy)]/40 block mb-1">다음 예약 (터치하여 변경)</span>
                        <div className="flex items-center gap-1">
                            <span className={cn("font-medium text-[var(--color-midnight-navy)]", client.isSessionCanceled && "line-through opacity-50")}>
                                {client.nextSession}
                            </span>
                            {client.sessionTime && <span className="text-xs text-[var(--color-midnight-navy)]/60">({client.sessionTime})</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Memo / Notes</h4>
                    <p className="text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                        {client.notes}
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsRescheduleOpen(true)}
                            className="flex-1 py-3 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20 active:scale-[0.98] transition-transform"
                        >
                            <Calendar className="w-4 h-4" />
                            일정 변경
                        </button>
                        {!client.isSessionCanceled && (
                            <button
                                onClick={handleCancelSession}
                                className="px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-medium active:scale-[0.98] transition-transform whitespace-nowrap"
                            >
                                취소
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleAddNote}
                            className="py-3 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium flex items-center justify-center gap-2 active:bg-gray-50"
                        >
                            <FileText className="w-4 h-4" />
                            간편 메모
                        </button>
                        <button className="py-3 bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] rounded-xl font-medium flex items-center justify-center gap-2 active:bg-gray-50">
                            <Phone className="w-4 h-4" />
                            통화 기록
                        </button>
                    </div>
                </div>
            </div>

            <RescheduleModal
                isOpen={isRescheduleOpen}
                onClose={() => setIsRescheduleOpen(false)}
                client={client}
            />
        </>
    );
}
