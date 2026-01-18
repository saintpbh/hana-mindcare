"use client";

import { useState, useEffect, useRef } from "react";
import { Save, RotateCcw, User, Clock, Trash2, X, Maximize2 } from "lucide-react";
import { createQuickNote, deleteQuickNote } from "@/app/actions/clients";
import { ManageQuickNotesModal } from "./ManageQuickNotesModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Client {
    id: string;
    name: string;
}

interface Note {
    id: string;
    content: string;
    createdAt: Date;
    client?: {
        name: string;
        id: string;
    } | null;
}

interface QuickNoteProps {
    initialNotes?: any[];
    clients?: any[];
}

export function QuickNote({ initialNotes = [], clients = [] }: QuickNoteProps) {
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "linked">("idle");
    const [linkedName, setLinkedName] = useState("");
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    // Tagging state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Client[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const handleSave = async (content: string) => {
        if (!content.trim()) return;

        setStatus("saving");
        const match = content.match(/#([가-힣]{2,4})\b/);
        const name = match ? match[1] : null;
        const cleanContent = match ? content.replace(/#([가-힣]{2,4})/, '').trim() : content.trim();

        const result = await createQuickNote(name, cleanContent);

        if (result.success && result.data) {
            if (name && result.data.clientName) {
                setLinkedName(result.data.clientName);
                setStatus("linked");
            } else {
                setStatus("saved");
            }

            // Add to local list
            const newNote: Note = {
                id: result.data.note.id,
                content: cleanContent,
                createdAt: new Date(),
                client: result.data.clientName ? { name: result.data.clientName, id: result.data.note.clientId || "" } : null
            };
            setNotes(prev => [newNote, ...prev].slice(0, 10));
            setNote("");
            localStorage.removeItem("hana_quick_note");
            setTimeout(() => setStatus("idle"), 3000);
        } else {
            setStatus("idle");
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
            e.preventDefault();
            await handleSave(note);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const pos = e.target.selectionStart;
        setNote(value);
        setCursorPosition(pos);
        localStorage.setItem("hana_quick_note", value);

        // Check for tagging
        const textBeforeCursor = value.slice(0, pos);
        const tagMatch = textBeforeCursor.match(/#([가-힣a-zA-Z0-9]*)$/);

        if (tagMatch) {
            const query = tagMatch[1].toLowerCase();
            const filtered = clients.filter((c: any) =>
                c.name.toLowerCase().includes(query)
            ).slice(0, 5);

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const applySuggestion = (clientName: string) => {
        const textBeforeTag = note.slice(0, cursorPosition).replace(/#([가-힣a-zA-Z0-9]*)$/, "");
        const textAfterCursor = note.slice(cursorPosition);
        const newText = `${textBeforeTag}#${clientName} ${textAfterCursor}`;
        setNote(newText);
        setShowSuggestions(false);
        textareaRef.current?.focus();
    };

    const handleDelete = async (id: string) => {
        const result = await deleteQuickNote(id);
        if (result.success) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="bg-[var(--color-warm-white)] rounded-3xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-inner h-full flex flex-col relative overflow-hidden transition-colors duration-500">
            {status === "linked" && (
                <div className="absolute inset-x-0 top-0 h-1 bg-green-500 z-10 animate-[loading_1s_ease-in-out]" />
            )}

            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[var(--color-midnight-navy)] text-sm uppercase tracking-wide flex items-center gap-2">
                        Quick Note
                        <span className="text-[10px] text-[var(--color-midnight-navy)]/30 font-normal normal-case border border-[var(--color-midnight-navy)]/10 px-1.5 py-0.5 rounded">
                            Tip: #이름 으로 기록 연동
                        </span>
                    </h3>
                    <button
                        onClick={() => setIsManageModalOpen(true)}
                        className="text-[10px] text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] flex items-center gap-1 transition-colors bg-white/50 px-2 py-1 rounded-lg hover:bg-white"
                    >
                        <Maximize2 className="w-3 h-3" />
                        모두보기
                    </button>
                </div>

                <span className={cn(
                    "text-xs transition-all duration-300 font-medium flex items-center gap-1",
                    status === "idle" && "opacity-0",
                    status === "saving" && "text-[var(--color-midnight-navy)]/40 opacity-100",
                    status === "saved" && "text-[var(--color-champagne-gold)] opacity-100",
                    status === "linked" && "text-green-600 opacity-100"
                )}>
                    {status === "saving" && (
                        <>
                            <div className="w-2 h-2 border-2 border-[var(--color-midnight-navy)]/20 border-t-[var(--color-midnight-navy)] rounded-full animate-spin" />
                            Saving...
                        </>
                    )}
                    {status === "saved" && <><Save className="w-3 h-3" /> Saved</>}
                    {status === "linked" && (
                        <>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            {linkedName}님 차트에 저장됨
                        </>
                    )}
                </span>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="relative flex-1 flex flex-col">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 w-full bg-transparent resize-none focus:outline-none text-[var(--color-midnight-navy)] text-sm placeholder-[var(--color-midnight-navy)]/30 leading-relaxed py-2"
                        placeholder="메모를 남기세요... (#이름 상담 특이사항)"
                        value={note}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                    />

                    {/* Suggestions Popover */}
                    {showSuggestions && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                            <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">내담자 선택</div>
                            {suggestions.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => applySuggestion(client.name)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-midnight-navy)]/5 flex items-center gap-2 transition-colors"
                                >
                                    <User className="w-3 h-3 opacity-30" />
                                    {client.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Notes List */}
                <div className="mt-4 pt-4 border-t border-[var(--color-midnight-navy)]/5 group/list">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 최근 기록 (최대 10개)
                        </span>
                    </div>
                    <div className="space-y-2">
                        {notes.length === 0 ? (
                            <div className="text-[10px] text-gray-300 italic py-4">최근 저장된 메모가 없습니다.</div>
                        ) : (
                            notes.map((n) => (
                                <div key={n.id} className="group/note relative bg-white/40 p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-6">
                                            <p className="text-xs text-[var(--color-midnight-navy)]/80 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                {n.client && (
                                                    <span className="text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 rounded-full font-medium">
                                                        <User className="w-2.5 h-2.5" />
                                                        {n.client.name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400">
                                                    {format(new Date(n.createdAt), "HH:mm", { locale: ko })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className="opacity-0 group-hover/note:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-all text-gray-300"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <ManageQuickNotesModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
            />
        </div>
    );
}
