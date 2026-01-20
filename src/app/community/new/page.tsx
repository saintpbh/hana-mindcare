"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Eye, Loader2 } from "lucide-react";
import { createPost } from "@/app/actions/community";

const CATEGORIES = ["상담 팁", "케이스 스터디", "정보 공유", "자료 요청", "운영/경영", "자유 수다"];

export default function NewPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddTag = () => {
        if (tagInput.trim() && tags.length < 5) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 입력해주세요.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const result = await createPost({
                title: title.trim(),
                content: content.trim(),
                category,
                tags,
                isAnonymous,
                authorId: isAnonymous ? undefined : "temp-user-id", // TODO: Get from auth
                authorName: isAnonymous ? undefined : "김상담", // TODO: Get from auth
                authorRole: isAnonymous ? undefined : "임상심리사" // TODO: Get from auth
            });

            setIsSubmitting(false);

            if (result.success) {
                router.push("/community");
            } else {
                console.error("Post creation failed:", result.error);
                setError(result.error || "게시글 작성에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("예상치 못한 오류가 발생했습니다. 개발자 도구(F12)의 Console 탭을 확인해주세요.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/community" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">새 글 쓰기</h1>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">동료들과 인사이트를 공유하세요</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="h-10 px-4 rounded-lg border border-[var(--color-midnight-navy)]/10 text-[var(--color-midnight-navy)] text-sm hover:bg-[var(--color-midnight-navy)]/5 transition-colors flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {showPreview ? "편집" : "미리보기"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-10 px-5 rounded-lg bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    발행 중...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    발행하기
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                !
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-rose-900 mb-1">오류 발생</h3>
                                <p className="text-sm text-rose-700">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="text-rose-400 hover:text-rose-600 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm p-8">
                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="제목을 입력하세요"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-2xl font-bold text-[var(--color-midnight-navy)] placeholder:text-[var(--color-midnight-navy)]/30 focus:outline-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-2">
                                    카테고리
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${category === cat
                                                ? "bg-[var(--color-midnight-navy)] text-white"
                                                : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/10"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <textarea
                                    placeholder="내용을 입력하세요... 마크다운을 지원합니다."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={15}
                                    className="w-full text-[var(--color-midnight-navy)] placeholder:text-[var(--color-midnight-navy)]/30 focus:outline-none resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-2">
                                    태그 (최대 5개)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full bg-[var(--color-champagne-gold)]/10 text-[var(--color-midnight-navy)] text-sm flex items-center gap-2"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => handleRemoveTag(index)}
                                                className="hover:text-rose-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {tags.length < 5 && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="태그 입력 후 Enter"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            className="flex-1 h-9 px-3 rounded-lg border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)]"
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            className="px-4 h-9 rounded-lg bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] text-sm hover:bg-[var(--color-midnight-navy)]/10"
                                        >
                                            추가
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Anonymous */}
                            <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-midnight-navy)]/5">
                                <input
                                    type="checkbox"
                                    id="anonymous"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-4 h-4 rounded border-[var(--color-midnight-navy)]/20"
                                />
                                <label htmlFor="anonymous" className="text-sm text-[var(--color-midnight-navy)]/70 cursor-pointer">
                                    익명으로 작성하기
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] text-xs font-medium">
                                        {category}
                                    </span>
                                    {isAnonymous && (
                                        <span className="text-xs text-[var(--color-midnight-navy)]/50">익명</span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--color-midnight-navy)]">
                                    {title || "제목 없음"}
                                </h2>
                                <div className="prose max-w-none text-[var(--color-midnight-navy)]/70">
                                    {content.split('\n').map((line, i) => (
                                        <p key={i}>{line || <br />}</p>
                                    ))}
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4">
                                        {tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/70 text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
