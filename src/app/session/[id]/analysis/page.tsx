"use client";

import Link from "next/link";
import { ArrowLeft, Brain, Activity, Clock, Moon } from "lucide-react";
import { SentimentChart } from "@/components/analysis/SentimentChart";
import { SOAPEditor } from "@/components/analysis/SOAPEditor";
import { InsightCard } from "@/components/analysis/InsightCard";


export const dynamic = 'force-dynamic';

export default function AnalysisPage() {
    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                                Session Analysis
                            </h1>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">
                                Sarah Chen • Oct 24, 2024
                            </p>
                        </div>
                    </div>
                    <button className="px-6 py-2.5 bg-[var(--color-midnight-navy)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors shadow-lg shadow-[var(--color-midnight-navy)]/20">
                        Export Report
                    </button>
                </div>

                {/* Hero: Emotional Journey */}
                <section>
                    <SentimentChart />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    {/* Left: Smart SOAP Note (Takes up 2 columns) */}
                    <section className="lg:col-span-2 h-full">
                        <SOAPEditor />
                    </section>

                    {/* Right: Key Discoveries & Insights */}
                    <section className="space-y-4 flex flex-col h-full">
                        <h3 className="text-sm font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider">
                            Key Discoveries
                        </h3>

                        <div className="grid grid-cols-1 gap-4 flex-1">
                            <InsightCard
                                icon={Brain}
                                title="Cognitive Pattern"
                                value="Catastrophizing"
                                trend="High Relevance"
                                trendUp={false}
                            />
                            <InsightCard
                                icon={Moon}
                                title="Sleep Quality"
                                value="4.2 hrs / avg"
                                trend="-1.5h"
                                trendUp={false}
                            />
                            <InsightCard
                                icon={Activity}
                                title="Engagement"
                                value="Active"
                                trend="+15%"
                                trendUp={true}
                            />

                            <div className="p-4 rounded-xl bg-[var(--color-midnight-navy)] text-white flex-1 flex flex-col justify-center gap-2 relative overflow-hidden group">
                                {/* Decorative background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />

                                <Clock className="w-6 h-6 text-[var(--color-champagne-gold)] mb-2" />
                                <h4 className="font-medium">Next Session Plan</h4>
                                <p className="text-sm text-white/70">Focus on "Cognitive Restructuring" exercises.</p>

                                <button className="mt-2 w-full py-2 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors">
                                    Schedule Now
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
