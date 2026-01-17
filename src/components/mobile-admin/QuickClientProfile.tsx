"use client";

import { Calendar, Clock, FileText, Phone, MoreVertical, Search, AlertCircle, Edit2 } from "lucide-react";
import { usePersistence } from "@/hooks/usePersistence";
import { Client } from "@/data/mockClients";

interface QuickClientProfileProps {
    client: Client;
}

export function QuickClientProfile({ client }: QuickClientProfileProps) {
    const { updateClient } = usePersistence();

    const handleReschedule = () => {
        const newDate = window.prompt("변경할 예약 날짜를 입력하세요 (YYYY-MM-DD):", client.nextSession);
        if (newDate) {
            updateClient({ ...client, nextSession: newDate });
        }
    };

    const handleAddNote = () => {
        const newNote = window.prompt("추가할 메모를 입력하세요:", "");
        if (newNote) {
            const updatedNotes = `${client.notes}\n[Mobile]: ${newNote}`;
            updateClient({ ...client, notes: updatedNotes });
        }
    };

    const isCrisis = client.status === "crisis";

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-midnight-navy)]/5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-warm-white)] flex items-center justify-center border-2 border-white shadow-sm text-2xl font-serif text-[var(--color-midnight-navy)]">
                        {client.name.substring(0, 1)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-midnight-navy)]">{client.name}</h2>
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
                    onClick={handleReschedule}
                    className="bg-[var(--color-warm-white)]/50 p-3 rounded-xl border border-[var(--color-midnight-navy)]/5 active:bg-[var(--color-midnight-navy)]/5 cursor-pointer relative group"
                >
                    <Edit2 className="w-3 h-3 absolute top-2 right-2 text-[var(--color-midnight-navy)]/20" />
                    <span className="text-xs text-[var(--color-midnight-navy)]/40 block mb-1">다음 예약 (터치하여 변경)</span>
                    <span className="font-medium text-[var(--color-midnight-navy)]">{client.nextSession}</span>
                </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Memo / Notes</h4>
                <p className="text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                    {client.notes}
                </p>
            </div>

            <div className="space-y-2">
                <button
                    onClick={handleReschedule}
                    className="w-full py-3 bg-[var(--color-midnight-navy)] text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20 active:scale-[0.98] transition-transform"
                >
                    <Calendar className="w-4 h-4" />
                    일정 변경 (Reschedule)
                </button>
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
    );
}
