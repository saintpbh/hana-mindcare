"use client";

import { useState } from "react";
import { Play, Pause, X, SkipBack, SkipForward, Send, Bookmark, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResourcePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    resource: {
        title: string;
        author: string;
        type: "audio" | "video" | "article";
        category: string;
        duration: string;
        coverColor: string;
    } | null;
    onPrescribe: () => void;
}

export function ResourcePreview({ isOpen, onClose, resource, onPrescribe }: ResourcePreviewProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!resource) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 text-white/70 hover:bg-black/20 hover:text-white transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex gap-4 items-start mb-6">
                                <div className={cn("w-20 h-24 rounded-lg shrink-0 shadow-md", resource.coverColor)} />
                                <div>
                                    <h2 className="text-2xl font-serif text-[var(--color-midnight-navy)] mb-1">{resource.title}</h2>
                                    <p className="text-sm text-[var(--color-midnight-navy)]/60 mb-3">{resource.author} • {resource.category}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)] text-xs font-semibold uppercase tracking-wider border border-[var(--color-midnight-navy)]/5">
                                            {resource.type === "audio" ? "오디오" : resource.type === "video" ? "비디오" : "아티클"}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)] text-xs font-semibold uppercase tracking-wider border border-[var(--color-midnight-navy)]/5">
                                            {resource.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Player / Content Placeholder */}
                            <div className="bg-[var(--color-warm-white)] rounded-2xl p-6 mb-8 border border-[var(--color-midnight-navy)]/5">
                                <div className="flex flex-col items-center justify-center py-8 text-[var(--color-midnight-navy)]/40 gap-4">
                                    {isPlaying ? (
                                        <div className="flex items-center gap-1">
                                            <span className="w-1 h-3 bg-[var(--color-champagne-gold)] animate-pulse" />
                                            <span className="w-1 h-5 bg-[var(--color-champagne-gold)] animate-pulse delay-75" />
                                            <span className="w-1 h-8 bg-[var(--color-champagne-gold)] animate-pulse delay-150" />
                                            <span className="w-1 h-5 bg-[var(--color-champagne-gold)] animate-pulse delay-75" />
                                            <span className="w-1 h-3 bg-[var(--color-champagne-gold)] animate-pulse" />
                                        </div>
                                    ) : (
                                        <Play className="w-12 h-12 opacity-20" />
                                    )}
                                    <p className="text-sm font-medium">{isPlaying ? "재생 중..." : "미리보기 (Preview)"}</p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-6">
                                    <button className="p-2 text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] transition-colors">
                                        <SkipBack className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="w-12 h-12 rounded-full bg-[var(--color-midnight-navy)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--color-midnight-navy)]/90 transition-colors"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                    </button>
                                    <button className="p-2 text-[var(--color-midnight-navy)]/40 hover:text-[var(--color-midnight-navy)] transition-colors">
                                        <SkipForward className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onPrescribe}
                                    className="flex-1 h-12 rounded-xl bg-[var(--color-champagne-gold)] text-white font-medium hover:bg-[var(--color-champagne-gold)]/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-champagne-gold)]/20"
                                >
                                    <Send className="w-4 h-4" />
                                    처방하기 (Prescribe)
                                </button>
                                <button className="h-12 w-12 rounded-xl border border-[var(--color-midnight-navy)]/10 flex items-center justify-center text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5 transition-colors">
                                    <Bookmark className="w-5 h-5" />
                                </button>
                                <button className="h-12 w-12 rounded-xl border border-[var(--color-midnight-navy)]/10 flex items-center justify-center text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
