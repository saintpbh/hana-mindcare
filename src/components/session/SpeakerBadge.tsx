import { cn } from "@/lib/utils";

interface SpeakerBadgeProps {
    speaker: "counselor" | "patient";
    className?: string;
}

export function SpeakerBadge({ speaker, className }: SpeakerBadgeProps) {
    const isCounselor = speaker === "counselor";

    return (
        <div className="flex items-center gap-2 mb-1">
            <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                speaker === "counselor" ? "text-[var(--color-midnight-navy)]/40" : "text-[var(--color-midnight-navy)]/60"
            )}>
                {speaker === "counselor" ? "상담사 (ME)" : "내담자"}
            </span>
        </div>
    );
}
