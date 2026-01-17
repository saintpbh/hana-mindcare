"use client";

import Link from "next/link";
import { ArrowLeft, Clock, FileText, AlertCircle } from "lucide-react";
import { ProfileHeader } from "@/components/patients/ProfileHeader";
import { MoodCalendar } from "@/components/patients/MoodCalendar";
import { MOCK_CLIENTS } from "@/data/mockClients";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PrescriptionModal } from "@/components/library/PrescriptionModal";
import { EditClientModal } from "@/components/patients/EditClientModal";
import { Client } from "@/data/mockClients";

export default function PatientPage() {
    const params = useParams();
    const router = useRouter();
    // In a real app, this initial state might come from an API or filtered MOCK_CLIENTS
    const initialClient = MOCK_CLIENTS.find(c => c.id === params.id);
    const [client, setClient] = useState<Client | undefined>(initialClient);

    const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (!client) {
        return (
            <div className="min-h-screen bg-[var(--color-warm-white)] p-8 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-[var(--color-midnight-navy)]/20 mx-auto mb-4" />
                    <h2 className="text-xl font-serif text-[var(--color-midnight-navy)] mb-2">내담자를 찾을 수 없습니다.</h2>
                    <Link href="/patients" className="text-sm font-medium text-[var(--color-midnight-navy)] hover:underline">
                        내담자 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Navigation */}
                <Link href="/patients" className="inline-flex items-center gap-2 text-sm text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    내담자 목록으로 돌아가기
                </Link>

                <ProfileHeader client={client} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Mood & Stats */}
                    <div className="space-y-8">
                        <MoodCalendar />

                        <div className="bg-white rounded-2xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                            <h3 className="font-semibold text-[var(--color-midnight-navy)] mb-4">참여 통계 (Engagement)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">총 세션 횟수</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">24회</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">결석 (No-show)</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">1회</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--color-midnight-navy)]/60">평균 세션 시간</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">52분</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Session History */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-semibold text-[var(--color-midnight-navy)] text-lg">최근 세션 기록 (History)</h3>

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-[var(--color-midnight-navy)]/5 shadow-sm hover:border-[var(--color-champagne-gold)]/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-[var(--color-midnight-navy)] group-hover:text-[var(--color-champagne-gold)] transition-colors">
                                            적응적 대처 전략 훈련
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/40 mt-1">
                                            <Clock className="w-3 h-3" />
                                            <span>2024년 10월 {24 - i * 7}일</span>
                                            <span>•</span>
                                            <span>세션 #{12 - i}</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-[var(--color-warm-white)] rounded text-[10px] font-medium text-[var(--color-midnight-navy)]/60 uppercase">
                                        분석 완료
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--color-midnight-navy)]/70 line-clamp-2">
                                    직장에서 발생한 갈등 상황에 대해 논의함. '잠시 멈춤' 기법을 연습하였으며, 지난주(7/10) 대비 불안 수준(4/10)이 감소했다고 보고함.
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <button className="text-xs flex items-center gap-1 font-medium text-[var(--color-midnight-navy)]/60 hover:text-[var(--color-midnight-navy)]">
                                        <FileText className="w-3 h-3" />
                                        상담 노트 보기
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
