"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";

export function QuickNote() {
    const [note, setNote] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedNote = localStorage.getItem("hana_quick_note");
        if (savedNote) setNote(savedNote);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNote(value);
        localStorage.setItem("hana_quick_note", value);

        // Simple visual feedback trigger
        setIsSaved(false);
        const timeout = setTimeout(() => setIsSaved(true), 1000);
        return () => clearTimeout(timeout);
    };

    return (
        <div className="bg-[var(--color-warm-white)] rounded-3xl p-6 border border-[var(--color-midnight-navy)]/5 shadow-inner h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[var(--color-midnight-navy)] text-sm uppercase tracking-wide">Quick Note</h3>
                <span className={`text-xs transition-opacity duration-300 ${isSaved ? "text-[var(--color-champagne-gold)] opacity-100" : "opacity-0"}`}>
                    Saved
                </span>
            </div>
            <textarea
                className="flex-1 w-full bg-transparent resize-none focus:outline-none text-[var(--color-midnight-navy)] text-sm placeholder-[var(--color-midnight-navy)]/30 leading-relaxed font-handwriting"
                placeholder="여기에 빠른 메모를 남기세요..."
                value={note}
                onChange={handleChange}
            />
        </div>
    );
}
