"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { type Client } from "@prisma/client";
import { usePersistence } from "@/hooks/usePersistence";

import { createQuickNoteById } from "@/app/actions/clients";

interface QuickNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
}

export function QuickNoteModal({ isOpen, onClose, client }: QuickNoteModalProps) {
    // const { updateClient } = usePersistence(); // Not needed for just adding a note anymore
    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Reset note when modal opens
    useEffect(() => {
        if (isOpen) {
            setNote("");
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (note.trim()) {
            setIsSaving(true);

            // 1. Server Action: Save to QuickNote table (visible on Desktop)
            const result = await createQuickNoteById(client.id, note.trim());

            if (result.success) {
                // 2. Optional: Also append to local client.notes if we want it visible in Mobile Admin immediately (legacy behavior)
                // const updatedNotes = `${client.notes}\n[Mobile]: ${note.trim()}`;
                // updateClient({ ...client, notes: updatedNotes });

                onClose();
            } else {
                alert("메모 저장에 실패했습니다.");
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--color-midnight-navy)]">간편 메모</h3>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">상담 내용을 빠르게 기록하세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/40 hover:bg-[var(--color-midnight-navy)]/5 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Textarea */}
                <div className="mb-6">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="메모 내용을 입력하세요..."
                        className="w-full h-32 p-4 rounded-xl bg-[var(--color-warm-white)]/30 border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] placeholder:text-[var(--color-midnight-navy)]/30 focus:outline-none focus:border-[var(--color-midnight-navy)]/30 focus:bg-white transition-all resize-none text-base"
                        autoFocus
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-500 font-bold text-lg active:scale-[0.98] transition-transform"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!note.trim()}
                        className="flex-[2] py-4 rounded-xl bg-[var(--color-midnight-navy)] text-white font-bold text-lg shadow-lg shadow-[var(--color-midnight-navy)]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        저장하기
                    </button>
                </div>

            </div>
        </div>
    );
}
