"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft, BrainCircuit, Mic, FileText, Sparkles, Check,
    Save, Clock, Calendar as CalendarIcon, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const [isAiDrafting, setIsAiDrafting] = useState(false);
    const [reportContent, setReportContent] = useState("");
    const [activeTab, setActiveTab] = useState<"transcript" | "memo">("transcript");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Mock Data based on sessionId (In real app, fetch from localized store/API)
    const clientName = "박지은";
    const sessionDate = new Date(); // Today

    const mockTranscript = `
[00:00] 상담사: 안녕하세요, 하나님. 지난 한 주는 어떠셨나요?
[00:05] 내담자: 음... 회사에서 스트레스가 좀 많았어요. 프로젝트 마감이 다가와서 야근도 잦았고요.
[00:15] 상담사: 그러셨군요. 야근 때문에 수면 패턴에도 영향이 있었나요?
[00:20] 내담자: 네, 거의 새벽 2시 넘어서 잤던 것 같아요. 그래서 아침에 일어나기가 너무 힘들었어요.
[00:30] 상담사: 수면 부족이 스트레스를 더 가중시켰을 수도 있겠네요. 구체적으로 어떤 감정이 드셨나요?
[00:40] 내담자: 그냥... 무기력하고, 다 그만두고 싶다는 생각이 불쑥 들었어요.
    `.trim();

    const handleAiDraft = () => {
        setIsAiDrafting(true);
        // Simulate streaming generation
        const draftText = `[S] 주소: 직장 내 프로젝트 마감 압박 및 야근으로 인한 스트레스 호소.
[O] 관찰: 피로한 기색이 역력하며, 목소리 톤이 낮고 무기력함. 수면 부족(새벽 2시 취침) 보고.
[A] 사정: 직무 스트레스와 수면 불규칙이 상호작용하여 우울감과 무기력감을 증폭시키고 있음. 회피 반응("다 그만두고 싶다")이 나타나고 있어 번아웃 초기 증상으로 의심됨.
[P] 계획:
1. 수면 위생 교육 및 수면 시간 확보 전략 수립.
2. 이완 요법(복식 호흡) 실습.
3. 다음 회기까지 기분 일기 작성 과제 부여.`;

        let i = 0;
        setReportContent("");
        const interval = setInterval(() => {
            setReportContent(draftText.slice(0, i));
            i++;
            if (i > draftText.length) {
                clearInterval(interval);
                setIsAiDrafting(false);
                setLastSaved(new Date());
            }
        }, 30); // Fast typing speed
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-[var(--color-midnight-navy)]/5 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--color-midnight-navy)] flex items-center gap-2">
                            상담 기록 작성
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {sessionId === 'new' ? '새 기록' : `#${sessionId}`}
                            </span>
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {clientName}</span>
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {sessionDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        {lastSaved ? <><Check className="w-3 h-3" /> {lastSaved.toLocaleTimeString()} 저장됨</> : "저장되지 않음"}
                    </span>
                    <button className="px-5 py-2 bg-[var(--color-midnight-navy)] text-white rounded-full text-sm font-bold hover:brightness-110 flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20 transition-all">
                        <Save className="w-4 h-4" />
                        작성 완료
                    </button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <main className="flex-1 flex min-h-0">
                {/* Left Panel: Context (Transcript & Notes) */}
                <aside className="w-[45%] border-r border-[var(--color-midnight-navy)]/5 bg-white flex flex-col">
                    <div className="p-2 border-b border-gray-100 flex gap-1">
                        <button
                            onClick={() => setActiveTab("transcript")}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors",
                                activeTab === "transcript" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Mic className="w-4 h-4" /> 녹취록 (Transcript)
                        </button>
                        <button
                            onClick={() => setActiveTab("memo")}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors",
                                activeTab === "memo" ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <FileText className="w-4 h-4" /> 상담 메모
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        {activeTab === "transcript" ? (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            RECORDING-001.mp3
                                        </div>
                                        <span className="text-xs text-gray-400">00:45:20</span>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 font-medium">
                                        {mockTranscript}
                                    </div>
                                </div>
                                <div className="text-center text-xs text-gray-400 mt-4">
                                    AI가 자동으로 생성한 스크립트입니다. 부정확할 수 있습니다.
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                등록된 사전 메모가 없습니다.
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Panel: Editor */}
                <section className="flex-1 flex flex-col bg-[var(--color-warm-white)]/30 relative">
                    {/* Toolbar */}
                    <div className="h-12 border-b border-[var(--color-midnight-navy)]/5 flex items-center px-4 justify-between bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            {/* Formatting tools mock */}
                            <div className="flex gap-1 border-r border-gray-200 pr-3 mr-3">
                                <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-serif font-bold cursor-pointer">B</span>
                                <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-serif italic cursor-pointer hover:bg-gray-100">I</span>
                                <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-serif underline cursor-pointer hover:bg-gray-100">U</span>
                            </div>
                            <select className="text-xs border-none bg-transparent font-medium text-gray-600 focus:outline-none cursor-pointer">
                                <option>SOAP 형식</option>
                                <option>DAP 형식</option>
                                <option>자유 서술</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAiDraft}
                            disabled={isAiDrafting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAiDrafting ? (
                                <BrainCircuit className="w-3 h-3 animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            {isAiDrafting ? "작성 중..." : "AI 초안 작성"}
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto bg-white min-h-[800px] shadow-sm border border-gray-200/50 rounded-none p-12 relative">
                            <textarea
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                                placeholder="상담 내용을 입력하세요..."
                                className="w-full h-full min-h-[700px] resize-none focus:outline-none text-[var(--color-midnight-navy)] leading-relaxed font-serif text-lg bg-transparent placeholder:text-gray-300"
                            />

                            {/* Paper guidelines visual */}
                            <div className="absolute top-12 left-0 w-full h-full pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_31px,black_32px)] bg-[length:100%_32px]"></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
