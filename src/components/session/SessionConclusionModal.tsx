"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Calendar, Download, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SessionConclusionModal({
    isOpen,
    onClose,
    clientName = "내담자",
    onWriteReport,
    onScheduleNext,
    onDownloadTranscript
}: {
    isOpen: boolean;
    onClose: () => void;
    clientName?: string;
    onWriteReport?: () => void;
    onScheduleNext?: () => void;
    onDownloadTranscript?: () => void;
}) {
    const router = useRouter();

    const handleWriteReport = () => {
        if (onWriteReport) {
            onWriteReport();
        } else {
            // Default behavior if no prop
            router.push(`/report/${Date.now()}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]">
                <div className="relative h-40 bg-[var(--color-midnight-navy)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="text-center z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 animate-in zoom-in duration-500">
                            <CheckCircle2 className="w-8 h-8 text-[var(--color-champagne-gold)]" />
                        </div>
                        <h2 className="text-2xl font-serif text-white font-bold">상담 세션이 종료되었습니다</h2>
                        <p className="text-white/60 text-sm mt-1">{clientName}님과의 50분 세션 완료</p>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-sm font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest mb-6">Recommended Actions</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={handleWriteReport}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--color-midnight-navy)] mb-1">상담 일지 작성</h4>
                                <p className="text-xs text-gray-500">AI 초안이 준비되었습니다</p>
                            </div>
                        </button>

                        <button
                            onClick={onScheduleNext}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group text-center">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--color-midnight-navy)] mb-1">다음 일정 예약</h4>
                                <p className="text-xs text-gray-500">2주 후 같은 시간 추천</p>
                            </div>
                        </button>

                        <button
                            onClick={onDownloadTranscript}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all group text-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <Download className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--color-midnight-navy)] mb-1">녹취록 다운로드</h4>
                                <p className="text-xs text-gray-500">MP3 및 텍스트 변환 완료</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-[var(--color-midnight-navy)] flex items-center gap-2"
                        >
                            다음에 하기 <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
