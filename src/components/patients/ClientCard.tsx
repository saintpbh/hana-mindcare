import { LucideIcon, MoreHorizontal, Calendar, Activity, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useConfirm } from "@/contexts/ConfirmContext";

interface ClientCardProps {
    id: string;
    name: string;
    status: "stable" | "attention" | "crisis" | "terminated";
    nextSession: string;
    lastSession: string;
    tags: string[];
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onRestart?: (id: string) => void;
}

export function ClientCard({ id, name, status, nextSession, lastSession, tags, isSelected, onSelect, onRestart }: ClientCardProps) {
    const { confirm } = useConfirm();
    const statusColors = {
        stable: "bg-[var(--color-midnight-navy)] text-white",
        attention: "bg-[var(--color-champagne-gold)] text-white",
        crisis: "bg-red-500 text-white",
        terminated: "bg-gray-400 text-white"
    };

    const statusLabels = {
        stable: "안정 (Stable)",
        attention: "주의 (Attention)",
        crisis: "위기 (Crisis)",
        terminated: "종결 (Terminated)"
    };

    return (
        <div className={cn(
            "group relative bg-white rounded-xl p-5 border transition-all duration-300",
            isSelected
                ? "border-[var(--color-midnight-navy)] shadow-md ring-1 ring-[var(--color-midnight-navy)] ring-inset"
                : "border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md"
        )}>
            {/* Selection Checkbox */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect?.(id);
                }}
                className={cn(
                    "absolute top-3 right-3 z-10 p-1 rounded-full transition-all",
                    isSelected
                        ? "text-[var(--color-midnight-navy)] opacity-100"
                        : "text-gray-200 opacity-0 group-hover:opacity-100 hover:text-[var(--color-midnight-navy)]/40"
                )}
            >
                {isSelected ? <CheckCircle2 className="w-5 h-5 fill-white" /> : <Circle className="w-5 h-5" />}
            </button>

            <Link href={`/patients/${id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-midnight-navy)]/5 flex items-center justify-center text-[var(--color-midnight-navy)] font-serif text-lg font-medium">
                            {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--color-midnight-navy)]">{name}</h3>
                            <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium mt-1", statusColors[status])}>
                                {statusLabels[status]}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Next: {nextSession}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-midnight-navy)]/60">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Last: {lastSession}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/70 text-[10px] font-medium border border-[var(--color-midnight-navy)]/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </Link>

            {/* Restart Button for Terminated Clients */}
            {status === "terminated" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (await confirm(`${name}님의 상담을 재시작하시겠습니까?`, {
                                title: "상담 재시작",
                                confirmText: "재시작",
                                variant: "default"
                            })) {
                                onRestart?.(id);
                            }
                        }}
                        className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        상담 재시작
                    </button>
                </div>
            )}
        </div>
    );
}
