"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Session, CounselingLog } from "@prisma/client";
import { CounselingLogForm } from "./CounselingLogForm";
import { updateTranscript, updateSessionNotes } from "@/app/actions/sessions";

interface SessionTabsProps {
    session: Session & { counselingLog: CounselingLog | null };
}

export function SessionTabs({ session }: SessionTabsProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "log" | "notes">("overview");
    const [transcript, setTranscript] = useState(session.transcript || "");
    const [isSavingTranscript, setIsSavingTranscript] = useState(false);

    // Notes State
    const [notes, setNotes] = useState(session.notes || "");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const handleTranscriptSave = async () => {
        setIsSavingTranscript(true);
        await updateTranscript(session.id, transcript);
        setIsSavingTranscript(false);
    };

    const handleNotesChange = (value: string) => {
        // Simple history: push state before change (limiting to last 10 steps to avoid memory bloat)
        setHistory(prev => [...prev.slice(-10), notes]);
        setNotes(value);
    };

    const handleUndoNotes = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setNotes(previous);
    };

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        await updateSessionNotes(session.id, notes);
        setIsSavingNotes(false);
    };

    return (
        <div>
            {/* Tab Headers */}
            <div className="flex text-sm font-medium border-b border-[var(--color-midnight-navy)]/10 mb-6">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                        "px-6 py-3 transition-colors relative",
                        activeTab === "overview"
                            ? "text-[var(--color-midnight-navy)]"
                            : "text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                    )}
                >
                    개요 (Overview)
                    {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-midnight-navy)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("notes")}
                    className={cn(
                        "px-6 py-3 transition-colors relative",
                        activeTab === "notes"
                            ? "text-[var(--color-midnight-navy)]"
                            : "text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                    )}
                >
                    세션 메모 (Session Notes)
                    {activeTab === "notes" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-midnight-navy)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("log")}
                    className={cn(
                        "px-6 py-3 transition-colors relative",
                        activeTab === "log"
                            ? "text-[var(--color-midnight-navy)]"
                            : "text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                    )}
                >
                    상담일지 (Counseling Log)
                    {activeTab === "log" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-midnight-navy)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("transcript")}
                    className={cn(
                        "px-6 py-3 transition-colors relative",
                        activeTab === "transcript"
                            ? "text-[var(--color-midnight-navy)]"
                            : "text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                    )}
                >
                    축어록 (Verbatim)
                    {activeTab === "transcript" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-midnight-navy)]" />}
                </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-white rounded-xl border border-[var(--color-midnight-navy)]/5 p-6 shadow-sm min-h-[500px]">

                {/* 1. Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-[var(--color-midnight-navy)] mb-4">상담 요약</h3>
                            <div className="p-4 bg-[var(--color-warm-white)] rounded-xl border border-[var(--color-midnight-navy)]/5 leading-relaxed text-[var(--color-midnight-navy)]">
                                {session.summary}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-[var(--color-midnight-navy)]/60 mb-2">주요 키워드</h4>
                                <div className="flex flex-wrap gap-2">
                                    {session.keywords.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-[var(--color-midnight-navy)]/5 rounded-full text-sm text-[var(--color-midnight-navy)]">
                                            #{k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-[var(--color-midnight-navy)]/60 mb-2">감정 분석</h4>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-sm font-medium",
                                    session.sentiment === "Negative" ? "bg-red-100 text-red-700" :
                                        session.sentiment === "Positive" ? "bg-green-100 text-green-700" :
                                            "bg-gray-100 text-gray-700"
                                )}>
                                    {session.sentiment}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Notes Tab */}
                {activeTab === "notes" && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-serif text-[var(--color-midnight-navy)]">세션 메모</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleUndoNotes}
                                    disabled={history.length === 0}
                                    className="px-3 py-1.5 text-xs font-medium text-[var(--color-midnight-navy)] bg-[var(--color-midnight-navy)]/5 rounded-lg hover:bg-[var(--color-midnight-navy)]/10 transition-colors disabled:opacity-50"
                                >
                                    되돌리기 (Undo)
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-midnight-navy)] rounded-lg hover:bg-[var(--color-midnight-navy)]/90 transition-colors disabled:opacity-50"
                                >
                                    {isSavingNotes ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            className="flex-1 w-full min-h-[400px] p-6 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] focus:outline-none focus:border-[var(--color-midnight-navy)] font-serif text-base leading-relaxed resize-none"
                            placeholder="이곳에 세션 중 기록한 메모를 작성하거나 수정하세요..."
                        />
                    </div>
                )}

                {/* 3. Log Tab */}
                {activeTab === "log" && (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-serif text-[var(--color-midnight-navy)]">상담일지 (SOAP)</h3>
                            <div className="text-xs text-[var(--color-midnight-navy)]/40 px-3 py-1 bg-[var(--color-midnight-navy)]/5 rounded-full">
                                Status: {session.counselingLog?.status || "NOT STARTED"}
                            </div>
                        </div>
                        <CounselingLogForm
                            sessionId={session.id}
                            initialData={session.counselingLog || undefined}
                        />
                    </div>
                )}

                {/* 4. Transcript Tab */}
                {activeTab === "transcript" && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-serif text-[var(--color-midnight-navy)]">전체 축어록</h3>
                            <button
                                onClick={handleTranscriptSave}
                                disabled={isSavingTranscript}
                                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-midnight-navy)] rounded-lg hover:bg-[var(--color-midnight-navy)]/90 transition-colors disabled:opacity-50"
                            >
                                {isSavingTranscript ? "저장 중..." : "저장"}
                            </button>
                        </div>
                        <p className="text-sm text-[var(--color-midnight-navy)]/40 mb-4">
                            상담 내용을 텍스트 형식으로 기록합니다. 외부 음성 파일을 붙여넣거나 직접 작성할 수 있습니다.
                        </p>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            className="flex-1 w-full min-h-[400px] p-6 rounded-xl border border-[var(--color-midnight-navy)]/10 bg-[var(--color-warm-white)] focus:outline-none focus:border-[var(--color-midnight-navy)] font-mono text-sm leading-relaxed resize-none"
                            placeholder="[00:00] 상담사: 안녕하세요. 지난 한 주는 어떠셨나요?..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
