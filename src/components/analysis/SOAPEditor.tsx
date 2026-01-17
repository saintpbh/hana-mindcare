"use client";

import { useState } from "react";
import { Sparkles, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SOAPSection {
    id: "s" | "o" | "a" | "p";
    title: string;
    content: string;
    placeholder: string;
}

const INITIAL_SECTIONS: SOAPSection[] = [
    { id: "s", title: "Subjective", content: "Patient reports feeling 'overwhelmed' by upcoming job interview. Mentions tightness in chest and difficulty sleeping (avg 4 hours/night).", placeholder: "Patient's statements..." },
    { id: "o", title: "Objective", content: "Patient appeared anxious (fidgeting, rapid speech). Affect was congruous with mood. Eye contact was intermittent.", placeholder: "Observations..." },
    { id: "a", title: "Assessment", content: "Symptoms consistent with Generalized Anxiety Disorder (GAD) exacerbated by situational stress. Avoidance coping mechanisms observed.", placeholder: "Clinical assessment..." },
    { id: "p", title: "Plan", content: "1. Practice grounding techniques (5-4-3-2-1) daily.\n2. Review sleep hygiene protocols.\n3. Next session scheduled for next Tuesday.", placeholder: "Treatment plan..." },
];

export function SOAPEditor() {
    const [sections, setSections] = useState(INITIAL_SECTIONS);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000); // Simulate AI generation
    };

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 flex items-center justify-between bg-[var(--color-warm-white)]">
                <h3 className="font-semibold text-[var(--color-midnight-navy)] flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--color-midnight-navy)] text-white">AI</span>
                    Smart SOAP Note
                </h3>
                <button
                    onClick={handleGenerate}
                    className="text-sm flex items-center gap-1.5 text-[var(--color-champagne-gold)] hover:text-[var(--color-champagne-gold)]/80 transition-colors font-medium"
                >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? "Refining..." : "Regenerate Draft"}
                </button>
            </div>

            <div className="grid grid-cols-2 grid-rows-2 h-full">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={cn(
                            "p-4 border-[var(--color-midnight-navy)]/5 flex flex-col gap-2 relative group transition-colors hover:bg-[var(--color-warm-white)]/50",
                            index % 2 === 0 ? "border-r" : "",
                            index < 2 ? "border-b" : ""
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-wider">
                                {section.title}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)]">
                                <Check className="w-3 h-3" />
                            </button>
                        </div>
                        <textarea
                            className="flex-1 w-full bg-transparent resize-none text-sm text-[var(--color-midnight-navy)] leading-relaxed outline-none placeholder:text-[var(--color-midnight-navy)]/20"
                            defaultValue={section.content}
                            placeholder={section.placeholder}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
