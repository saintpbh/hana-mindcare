import { LucideIcon, MoreHorizontal, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
    name: string;
    status: "stable" | "attention" | "crisis";
    nextSession: string;
    lastSession: string;
    tags: string[];
}

export function ClientCard({ name, status, nextSession, lastSession, tags }: ClientCardProps) {
    const statusColors = {
        stable: "bg-[var(--color-midnight-navy)] text-white",
        attention: "bg-[var(--color-champagne-gold)] text-white",
        crisis: "bg-red-500 text-white"
    };

    const statusLabels = {
        stable: "안정 (Stable)",
        attention: "주의 (Attention)",
        crisis: "위기 (Crisis)"
    };

    return (
        <div className="group relative bg-white rounded-xl p-5 border border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md transition-all duration-300">
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
                <button className="text-[var(--color-midnight-navy)]/20 hover:text-[var(--color-midnight-navy)] transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
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
        </div>
    );
}
