"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Resource, ResourceGrid } from "@/components/library/ResourceGrid";
import { ResourcePreview } from "@/components/library/ResourcePreview";
import { PrescriptionModal } from "@/components/library/PrescriptionModal";

// Mock Data
const RESOURCES: Resource[] = [
    { id: "1", title: "아침 그라운딩 명상", author: "Dr. Elena Ray", type: "audio", category: "마음챙김", duration: "10분", coverColor: "bg-teal-700" },
    { id: "2", title: "수면 위생 101", author: "Serene Science", type: "article", category: "수면", duration: "5분 읽기", coverColor: "bg-indigo-900" },
    { id: "3", title: "불안 급성 처방 (SOS)", author: "Dr. Mark S.", type: "audio", category: "불안", duration: "3분", coverColor: "bg-rose-800" },
    { id: "4", title: "걷기 명상 가이드", author: "Nature Sounds", type: "audio", category: "마음챙김", duration: "20분", coverColor: "bg-emerald-800" },
    { id: "5", title: "CBT의 이해", author: "Clinic Team", type: "video", category: "교육", duration: "15분", coverColor: "bg-blue-800" },
    { id: "6", title: "점진적 근육 이완법", author: "Dr. Elena Ray", type: "audio", category: "수면", duration: "25분", coverColor: "bg-violet-900" },
];

export default function LibraryPage() {
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isPrescribing, setIsPrescribing] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                            라이브러리 (Serene Library)
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-midnight-navy)]/40" />
                            <input
                                type="text"
                                placeholder="자료 검색..."
                                className="h-10 pl-10 pr-4 rounded-full bg-white border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)] w-64 transition-colors"
                            />
                        </div>
                        <button className="h-10 px-4 rounded-full border border-[var(--color-midnight-navy)]/10 bg-white text-[var(--color-midnight-navy)] text-sm font-medium hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            필터
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                    {["전체", "마음챙김 (Mindfulness)", "불안 (Anxiety)", "수면 (Sleep)", "우울 (Depression)", "교육 (Education)", "신체 (Somatic)"].map((cat, i) => (
                        <button
                            key={cat}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                i === 0
                                    ? "bg-[var(--color-midnight-navy)] text-white"
                                    : "bg-white border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] hover:border-[var(--color-midnight-navy)]"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <section>
                    <h2 className="text-sm font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-6">금주의 추천 콘텐츠 (Featured)</h2>
                    <ResourceGrid
                        resources={RESOURCES}
                        onSelect={(r) => setSelectedResource(r)}
                    />
                </section>

            </div>

            {/* Modals */}
            <ResourcePreview
                isOpen={!!selectedResource}
                onClose={() => setSelectedResource(null)}
                resource={selectedResource}
                onPrescribe={() => {
                    // Close preview and open prescription modal
                    // (In a real app, we might keep preview open behind)
                    // For now, let's close preview to keep focus clear
                    setIsPrescribing(true);
                }}
            />

            <PrescriptionModal
                isOpen={isPrescribing}
                onClose={() => {
                    setIsPrescribing(false);
                    setSelectedResource(null);
                }}
                resourceTitle={selectedResource?.title || ""}
            />
        </div>
    );
}
