"use client";

import { PlayCircle, Video, BookOpen, ChevronRight } from "lucide-react";

import { useEffect, useState } from "react";
import { getClientPrescriptions } from "@/app/actions/prescriptions";

export function PrescriptionBox({ clientId }: { clientId: string }) {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            const res = await getClientPrescriptions(clientId);
            if (res.success) setPrescriptions(res.data || []);
        };
        fetchPrescriptions();
    }, [clientId]);

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'video': return { icon: Video, color: "bg-indigo-100 text-indigo-600", label: "동영상 시청하기" };
            default: return { icon: BookOpen, color: "bg-teal-100 text-teal-600", label: "읽기 자료" };
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-[var(--color-midnight-navy)] px-1">도착한 처방함</h3>

            {prescriptions.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                    아직 도착한 처방이 없습니다.
                </div>
            ) : (
                prescriptions.map((item) => {
                    const details = getTypeDetails(item.type);
                    return (
                        <button
                            key={item.id}
                            className="w-full bg-white p-4 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm flex items-center gap-4 hover:border-[var(--color-champagne-gold)]/50 transition-colors text-left"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${details.color}`}>
                                <details.icon className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-[var(--color-midnight-navy)] truncate pr-2">
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-[var(--color-midnight-navy)]/40 whitespace-nowrap bg-[var(--color-warm-white)] px-1.5 py-0.5 rounded">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-midnight-navy)]/60">
                                    <details.icon className="w-3 h-3" /> {details.label}
                                </div>
                            </div>

                            <ChevronRight className="w-5 h-5 text-[var(--color-midnight-navy)]/20" />
                        </button>
                    );
                })
            )}
        </div>
    );
}
