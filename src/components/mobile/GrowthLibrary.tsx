import { useEffect, useState } from "react";
import { getClientPrescriptions, togglePrescriptionCompletion } from "@/app/actions/prescriptions";
import { BookOpen, Video, FileText, Headphones, ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GrowthLibraryProps {
    clientId: string;
}

export function GrowthLibrary({ clientId }: GrowthLibraryProps) {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<"all" | "homework" | "knowledge">("all");

    const loadData = async () => {
        setLoading(true);
        const res = await getClientPrescriptions(clientId);
        if (res.success) setPrescriptions(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [clientId]);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await togglePrescriptionCompletion(id, !currentStatus);
        if (res.success) {
            setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !currentStatus } : p));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "video": return <Video className="w-5 h-5 text-blue-500" />;
            case "audio": return <Headphones className="w-5 h-5 text-purple-500" />;
            case "homework": return <CheckCircle2 className="w-5 h-5 text-amber-500" />;
            default: return <FileText className="w-5 h-5 text-emerald-500" />;
        }
    };

    const filtered = prescriptions.filter(p => {
        if (activeCategory === "all") return true;
        if (activeCategory === "homework") return p.type === "homework";
        return p.type !== "homework";
    });

    if (loading) return <div className="p-8 text-center text-[var(--color-midnight-navy)]/40 animate-pulse font-serif italic">내면의 지혜를 불러오는 중...</div>;

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h3 className="text-xl font-serif text-[var(--color-midnight-navy)]">성장 라이브러리</h3>
                <p className="text-sm text-[var(--color-midnight-navy)]/40">상담사와 함께 나눈 소중한 기록들입니다.</p>
            </header>

            {/* Category Tabs */}
            <div className="flex gap-2 p-1 bg-[var(--color-midnight-navy)]/5 rounded-2xl">
                {(["all", "homework", "knowledge"] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize",
                            activeCategory === cat ? "bg-white text-[var(--color-midnight-navy)] shadow-sm" : "text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]"
                        )}
                    >
                        {cat === 'all' ? '전체' : cat === 'homework' ? '나의 과제' : '지식 창고'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center"
                        >
                            <BookOpen className="w-12 h-12 text-[var(--color-midnight-navy)]/5 mx-auto mb-4" />
                            <p className="text-sm text-[var(--color-midnight-navy)]/30">항목이 비어있습니다.</p>
                        </motion.div>
                    ) : (
                        filtered.map((p, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={p.id}
                                className={cn(
                                    "bg-white rounded-3xl p-5 border transition-all group relative overflow-hidden",
                                    p.isCompleted ? "border-emerald-100 bg-emerald-50/30" : "border-[var(--color-midnight-navy)]/5 shadow-sm"
                                )}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center",
                                        p.isCompleted ? "bg-emerald-100" : "bg-[var(--color-warm-white)]"
                                    )}>
                                        {getIcon(p.type)}
                                    </div>
                                    {p.type === 'homework' && (
                                        <button
                                            onClick={() => handleToggle(p.id, p.isCompleted)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                                                p.isCompleted
                                                    ? "bg-emerald-500 text-white border-emerald-500"
                                                    : "bg-white text-amber-500 border-amber-200 hover:bg-amber-50"
                                            )}
                                        >
                                            {p.isCompleted ? "완료됨" : "미완료"}
                                        </button>
                                    )}
                                </div>

                                <h4 className={cn("font-bold text-[var(--color-midnight-navy)] mb-1", p.isCompleted && "line-through opacity-50")}>
                                    {p.title}
                                </h4>
                                <p className="text-xs text-[var(--color-midnight-navy)]/50 line-clamp-2 leading-relaxed">
                                    {p.description || "이 자료를 통해 지난 상담을 되짚어보세요."}
                                </p>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-midnight-navy)] transition-colors" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
