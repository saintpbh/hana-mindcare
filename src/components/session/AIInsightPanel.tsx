"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightPanelProps {
    isVisible: boolean;
    transcriptCount: number;
}

export function AIInsightPanel({ isVisible, transcriptCount }: AIInsightPanelProps) {
    // Mock insights mapped to transcript lines (roughly)
    const insights = [
        {
            triggerAt: 1, // After 1st message
            type: "sentiment",
            title: "Sentiment Analysis",
            content: "Neutral start. Patient seems hesitant.",
            icon: TrendingUp,
            color: "text-blue-500 bg-blue-50"
        },
        {
            triggerAt: 2, // After "chest feels tight"
            type: "keyword", // Anxiety
            title: "Vital Signal Detected",
            content: "Keyword: 'Chest Tightness' (Somatic Symptom of Anxiety)",
            icon: Brain,
            color: "text-rose-500 bg-rose-50"
        },
        {
            triggerAt: 3, // Counselor asks about feeling
            type: "suggestion",
            title: "Suggested Approach",
            content: "Explore the physical sensation further. Use 'Focusing' technique.",
            icon: Lightbulb,
            color: "text-amber-500 bg-amber-50"
        },
        {
            triggerAt: 4, // Patient describes "heavy stone"
            type: "insight",
            title: "Metaphor Identified",
            content: "Metaphor: 'Heavy Stone'. Indicates burden/pressure.",
            icon: Sparkles,
            color: "text-purple-500 bg-purple-50"
        }
    ];

    const currentInsights = insights.filter(i => i.triggerAt <= transcriptCount);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-full border-l border-[var(--color-midnight-navy)]/5 bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col"
                >
                    <div className="p-4 border-b border-[var(--color-midnight-navy)]/5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--color-champagne-gold)]" />
                        <h3 className="font-semibold text-[var(--color-midnight-navy)] text-sm">AI Insights</h3>
                        <span className="ml-auto text-xs text-[var(--color-midnight-navy)]/40 font-mono">LIVE</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentInsights.length === 0 ? (
                            <div className="text-center text-[var(--color-midnight-navy)]/40 text-xs py-10">
                                Waiting for conversation...
                            </div>
                        ) : (
                            currentInsights.map((insight, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-midnight-navy)]/5 hover:shadow-md transition-shadow cursor-default"
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", insight.color)}>
                                            <insight.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-midnight-navy)] text-xs uppercase tracking-wide">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-[var(--color-midnight-navy)]/80 mt-1 leading-relaxed">
                                                {insight.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )).reverse() // Show newest first
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
