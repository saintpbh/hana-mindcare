"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { AudioVisualizer } from "@/components/session/AudioVisualizer";
import { TranscriptStream } from "@/components/session/TranscriptStream";
import { NoteEditor } from "@/components/session/NoteEditor";
import { FloatingActions } from "@/components/ui/FloatingActions";

export default function SessionPage() {
    const params = useParams();

    return (
        <div className="h-screen flex flex-col bg-[var(--color-warm-white)] overflow-hidden">
            {/* Minimal Session Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--color-midnight-navy)]/5 bg-white/50 backdrop-blur-sm z-30">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-base font-semibold text-[var(--color-midnight-navy)]">
                            Session with Sarah Chen
                        </h1>
                        <p className="text-xs text-[var(--color-midnight-navy)]/50">
                            ID: {params.id} • Weekly Check-in
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] font-mono text-sm">
                    <Clock className="w-4 h-4" />
                    <span>14:23</span>
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">

                {/* Left: Deep Listen Zone */}
                <div className="flex-[4] flex flex-col gap-6 min-w-0">
                    {/* Visualizer Card */}
                    <div className="bg-white/80 p-6 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm flex flex-col items-center justify-center gap-2">
                        <span className="text-xs font-bold tracking-widest text-[var(--color-champagne-gold)] uppercase">Deep Listen Active</span>
                        <AudioVisualizer />
                    </div>

                    {/* Transcript Stream */}
                    <div className="flex-1 min-h-0 relative">
                        <TranscriptStream />
                        {/* Gradient fade at bottom for elegance */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
                    </div>
                </div>

                {/* Right: Zen Note Editor */}
                <div className="flex-[5] flex flex-col min-w-0 h-full">
                    <NoteEditor />
                </div>

                {/* Floating Controls */}
                <FloatingActions />
            </main>
        </div>
    );
}
