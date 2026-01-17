import { LucideIcon, ArrowUpRight } from "lucide-react";

interface InsightCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
}

export function InsightCard({ icon: Icon, title, value, trend, trendUp }: InsightCardProps) {
    return (
        <div className="p-4 rounded-xl bg-white border border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                        {trend}
                        <ArrowUpRight className={`w-3 h-3 ${trendUp ? '' : 'rotate-90'}`} />
                    </div>
                )}
            </div>
            <h4 className="text-sm text-[var(--color-midnight-navy)]/60 mb-1">{title}</h4>
            <p className="text-lg font-semibold text-[var(--color-midnight-navy)]">{value}</p>
        </div>
    );
}
