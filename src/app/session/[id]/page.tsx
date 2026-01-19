
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { AudioVisualizer } from "@/components/session/AudioVisualizer";
import { TranscriptStream, INITIAL_TRANSCRIPT } from "@/components/session/TranscriptStream";
import { NoteEditor } from "@/components/session/NoteEditor";
import { AIInsightPanel } from "@/components/session/AIInsightPanel";
import { FloatingActions } from "@/components/ui/FloatingActions";
import { cn } from "@/lib/utils";
import { createSession } from "@/app/actions/sessions";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);

    const [transcriptCount, setTranscriptCount] = useState(0);
    const [notes, setNotes] = useState("");

    // Session Timer Logic
    const [duration, setDuration] = useState(0);
    const SESSION_TARGET_MINUTES = 50; // Could be configurable later

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    const isOverTime = duration >= SESSION_TARGET_MINUTES * 60;

    const onEndSessionClick = () => {
        setIsEndSessionModalOpen(true);
    };

    const handleConfirmEndSession = async () => {
        setIsEndSessionModalOpen(false);

        // Collect data
        // For the simulation, we reconstruct the transcript based on what was "streamed"
        const currentTranscript = INITIAL_TRANSCRIPT.slice(0, transcriptCount)
            .map(item => `[${item.timestamp}] ${item.speaker === 'counselor' ? '상담사' : '내담자'}: ${item.text} `)
            .join('\n');

        const result = await createSession({
            clientId: params.id as string,
            title: `세션 #${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} `, // Simple auto-title
            summary: "세션 요약 생성 중...", // Placeholder, ideally specific field or generated
            sentiment: "Neutral", // Default/Placeholder
            keywords: [],
            transcript: currentTranscript,
            notes: notes,
            date: new Date(),
        });

        if (result.success) {
            router.push(`/patients/${params.id}`);
        } else {
            alert("세션 저장 실패: " + result.error);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--color-warm-white)] overflow-hidden">
            {/* Minimal Session Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--color-midnight-navy)]/5 bg-white/50 backdrop-blur-sm z-30">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-base font-semibold text-[var(--color-midnight-navy)]">
                            Session with Sarah Chen
                        </h1>
                        <p className="text-xs text-[var(--color-midnight-navy)]/50">
                            ID: {params.id} • Weekly Check-in
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm transition-colors",
                        isOverTime
                            ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                            : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]"
                    )}>
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(duration)}</span>
                        {isOverTime && <span className="text-[10px] font-bold">OVER</span>}
                    </div>

                    <button
                        onClick={onEndSessionClick}
                        className="px-4 py-1.5 bg-[var(--color-midnight-navy)] text-white text-sm font-medium rounded-full hover:bg-[var(--color-midnight-navy)]/90 transition-colors"
                    >
                        세션 종료
                    </button>
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">

                {/* Left: Deep Listen Zone */}
                <div className="flex-[4] flex flex-col gap-6 min-w-0">
                    {/* Visualizer Card */}
                    <div className="bg-white/80 p-6 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm flex flex-col items-center justify-center gap-2">
                        <span className="text-xs font-bold tracking-widest text-[var(--color-champagne-gold)] uppercase">
                            {isRecording ? "Deep Listen Active" : "Ready to Listen"}
                        </span>
                        <AudioVisualizer isRecording={isRecording} />
                    </div>

                    {/* Transcript Stream */}
                    <div className="flex-1 min-h-0 relative">
                        <TranscriptStream
                            isRecording={isRecording}
                            onProgress={setTranscriptCount}
                        />
                        {/* Gradient fade at bottom for elegance */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
                    </div>
                </div>

                {/* Middle: Zen Note Editor (Resize based on sidebar) */}
                <div className="flex-[5] flex flex-col min-w-0 h-full transition-all duration-300">
                    <NoteEditor value={notes} onChange={setNotes} />
                </div>

                {/* Right: AI Insight Panel (Slide-in) */}
                <AIInsightPanel isVisible={showInsights} transcriptCount={transcriptCount} />

                {/* Floating Controls */}
                <FloatingActions
                    isRecording={isRecording}
                    onToggleRecording={() => setIsRecording(!isRecording)}
                    onToggleInsights={() => setShowInsights(!showInsights)}
                />
            </main>

            {/* End Session Confirmation Modal */}
            <Dialog open={isEndSessionModalOpen} onOpenChange={setIsEndSessionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>세션 종료 확인</DialogTitle>
                        <DialogDescription>
                            현재 세션을 종료하고 상담 내용을 저장하시겠습니까?<br />
                            종료 후에는 상담 요약 및 분석 페이지로 이동합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setIsEndSessionModalOpen(false)}
                            className="px-4 py-2 text-sm text-[var(--color-midnight-navy)] hover:bg-[var(--color-midnight-navy)]/5 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleConfirmEndSession}
                            className="px-4 py-2 text-sm bg-[var(--color-midnight-navy)] text-white hover:bg-[var(--color-midnight-navy)]/90 rounded-lg transition-colors"
                        >
                            종료 및 저장
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
