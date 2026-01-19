"use client";

import { useEffect, useState } from "react";
import { getClientPrescriptions } from "@/app/actions/prescriptions";
import { BookOpen, Video, FileText, Headphones, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface GrowthLibraryProps {
    clientId: string;
}

export function GrowthLibrary({ clientId }: GrowthLibraryProps) {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const res = await getClientPrescriptions(clientId);
        if (res.success) setPrescriptions(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [clientId]);

    const getIcon = (type: string) => {
        switch (type) {
            case "video": return <Video className="w-5 h-5 text-blue-500" />;
            case "audio": return <Headphones className="w-5 h-5 text-purple-500" />;
            default: return <FileText className="w-5 h-5 text-emerald-500" />;
        }
    };

    if (loading) return <div className="p-8 text-center text-[var(--color-midnight-navy)]/40 animate-pulse">자료를 불러오는 중...</div>;

    if (prescriptions.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-[var(--color-midnight-navy)]/20" />
            </div>
            <p className="text-[var(--color-midnight-navy)]/40 text-sm">함께 나눈 자료가 아직 없습니다.<br />다음 세션에서 준비해 드릴게요.</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h3 className="text-xl font-serif text-[var(--color-midnight-navy)]">성장 라이브러리</h3>
                <p className="text-sm text-[var(--color-midnight-navy)]/40">상담사와 함께 나눈 소중한 기록들입니다.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {prescriptions.map((p, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={p.id}
                        className="bg-white rounded-3xl p-5 border border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--color-warm-white)] flex items-center justify-center">
                                {getIcon(p.type)}
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-midnight-navy)] transition-colors" />
                        </div>

                        <h4 className="font-bold text-[var(--color-midnight-navy)] mb-1">{p.title}</h4>
                        <p className="text-xs text-[var(--color-midnight-navy)]/50 line-clamp-2 leading-relaxed">
                            {p.description || "이 자료를 통해 지난 상담을 되짚어보세요."}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[10px] bg-[var(--color-midnight-navy)] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {p.type === 'article' ? 'Reading' : p.type}
                            </span>
                            <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
