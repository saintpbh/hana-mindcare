"use client";

import { useState, useEffect } from "react";
import { X, Search, Trash2, Edit2, Check, User, Clock, AlertCircle } from "lucide-react";
import { getAllQuickNotes, deleteQuickNote, updateQuickNote } from "@/app/actions/clients";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/contexts/ConfirmContext";

interface ManageQuickNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ManageQuickNotesModal({ isOpen, onClose }: ManageQuickNotesModalProps) {
    const { confirm } = useConfirm();
    const [notes, setNotes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen]);

    const fetchNotes = async () => {
        setIsLoading(true);
        const res = await getAllQuickNotes();
        if (res.success) {
            setNotes(res.data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (await confirm("정말로 이 메모를 삭제하시겠습니까?", {
            title: "메모 삭제",
            confirmText: "삭제",
            variant: "destructive"
        })) {
            const res = await deleteQuickNote(id);
            if (res.success) {
                setNotes(prev => prev.filter(n => n.id !== id));
            }
        }
    };

    const handleEditStart = (note: any) => {
        setEditingId(note.id);
        setEditContent(note.content);
    };

    const handleEditSave = async (id: string) => {
        const res = await updateQuickNote(id, editContent);
        if (res.success) {
            setNotes(prev => prev.map(n => n.id === id ? { ...n, content: editContent } : n));
            setEditingId(null);
        }
    };

    const filteredNotes = notes.filter(n =>
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.client?.name && n.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[var(--color-midnight-navy)]/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif text-[var(--color-midnight-navy)]">퀵노트 관리</h2>
                        <p className="text-sm text-neutral-500">모든 저장된 메모를 확인하고 관리하세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="메모 내용이나 내담자 이름으로 검색..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <div className="w-8 h-8 border-2 border-[var(--color-midnight-navy)]/20 border-t-[var(--color-midnight-navy)] rounded-full animate-spin mb-4" />
                            <p>불러오는 중...</p>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                            <p>저장된 메모가 없습니다.</p>
                        </div>
                    ) : (
                        filteredNotes.map((n) => (
                            <div key={n.id} className="group bg-neutral-50 p-4 rounded-2xl border border-neutral-100 hover:border-[var(--color-midnight-navy)]/10 hover:bg-white transition-all">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        {editingId === n.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full bg-white border border-[var(--color-midnight-navy)]/20 rounded-xl p-3 text-sm focus:outline-none"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100 rounded-lg"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditSave(n.id)}
                                                        className="px-3 py-1 text-xs bg-[var(--color-midnight-navy)] text-white rounded-lg hover:brightness-110"
                                                    >
                                                        저장
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[var(--color-midnight-navy)]/80 leading-relaxed whitespace-pre-wrap">
                                                {n.content}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                                            {n.client && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/70 rounded-full font-medium">
                                                    <User className="w-2.5 h-2.5" />
                                                    {n.client.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {format(new Date(n.createdAt), "yyyy. MM. dd HH:mm", { locale: ko })}
                                            </span>
                                        </div>
                                    </div>

                                    {editingId !== n.id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditStart(n)}
                                                className="p-2 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors text-neutral-300"
                                                title="수정"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(n.id)}
                                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-neutral-300"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
