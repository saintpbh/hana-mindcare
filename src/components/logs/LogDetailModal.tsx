"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { User, Calendar, Clock, FileText, CheckCircle2 } from "lucide-react";

interface LogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any; // Using any for now to match the logs structure, ideally should be typed
}

export function LogDetailModal({ isOpen, onClose, log }: LogDetailModalProps) {
    if (!log) return null;

    const sessionDate = new Date(log.session.date);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--color-warm-white)] p-0 rounded-3xl border-none">
                <div className="relative bg-[var(--color-midnight-navy)] p-6 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <DialogHeader className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <DialogTitle className="text-2xl font-serif mb-1">{log.session.client.name} 내담자 상담 일지</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    {log.session.title}
                                </DialogDescription>
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                {log.status === 'FINAL' ? '제출 완료' : '작성 중'}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-indigo-200">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-white/40" />
                                {format(sessionDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-white/40" />
                                {format(sessionDate, "a h:mm", { locale: ko })} ({log.session.duration}분)
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-white/40" />
                                {log.writerName || "작성자 미정"}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* SOAP Sections */}
                    <div className="space-y-4">
                        <Section title="Subjective (주관적 보고)" content={log.subjective} color="bg-blue-50 text-blue-900 border-blue-100" />
                        <Section title="Objective (객관적 관찰)" content={log.objective} color="bg-indigo-50 text-indigo-900 border-indigo-100" />
                        <Section title="Assessment (사정 및 평가)" content={log.assessment} color="bg-amber-50 text-amber-900 border-amber-100" />
                        <Section title="Plan (치료 계획)" content={log.plan} color="bg-emerald-50 text-emerald-900 border-emerald-100" />
                    </div>

                    {/* Footer Info */}
                    <div className="pt-6 border-t border-[var(--color-midnight-navy)]/10 text-xs text-[var(--color-midnight-navy)]/40 flex justify-between">
                        <div>
                            Last updated: {format(new Date(log.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                        </div>
                        <div>
                            Log ID: {log.id}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, content, color }: { title: string, content: string | null, color: string }) {
    return (
        <div className={`p-4 rounded-xl border ${color}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2 flex items-center gap-2">
                <FileText className="w-3 h-3" /> {title}
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {content || "내용 없음"}
            </p>
        </div>
    );
}
