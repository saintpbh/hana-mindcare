"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toggleLike, toggleBookmark, checkUserLikeStatus, checkUserBookmarkStatus } from "@/app/actions/community";

export function PostDetailClient({ postId, initialLikeCount }: { postId: string; initialLikeCount: number }) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check initial like/bookmark status
    useEffect(() => {
        const checkStatus = async () => {
            const userId = "temp-user-id"; // TODO: Get from auth

            const [likeStatus, bookmarkStatus] = await Promise.all([
                checkUserLikeStatus(postId, userId),
                checkUserBookmarkStatus(postId, userId)
            ]);

            if (likeStatus.success && likeStatus.isLiked !== undefined) {
                setIsLiked(likeStatus.isLiked);
            }
            if (bookmarkStatus.success && bookmarkStatus.isBookmarked !== undefined) {
                setIsBookmarked(bookmarkStatus.isBookmarked);
            }
        };

        checkStatus();
    }, [postId]);

    const handleLike = async () => {
        if (isLoading) return;

        setIsLoading(true);

        // Optimistic update
        const wasLiked = isLiked;
        setIsLiked(!isLiked);
        setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

        const result = await toggleLike(postId, "temp-user-id"); // TODO: Get from auth

        if (!result.success) {
            // Revert on error
            setIsLiked(wasLiked);
            setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        }

        setIsLoading(false);
    };

    const handleBookmark = async () => {
        if (isLoading) return;

        setIsLoading(true);
        const result = await toggleBookmark(postId, "temp-user-id"); // TODO: Get from auth

        if (result.success) {
            setIsBookmarked(result.isBookmarked);
        }

        setIsLoading(false);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다!");
    };

    return (
        <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-midnight-navy)]/5">
            <button
                onClick={handleLike}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isLiked
                    ? "bg-rose-50 text-rose-500"
                    : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/10"
                    } disabled:opacity-50`}
            >
                <Heart className={`w-4 h-4 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
                <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <button
                onClick={handleBookmark}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isBookmarked
                    ? "bg-[var(--color-champagne-gold)]/10 text-[var(--color-champagne-gold)]"
                    : "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/10"
                    } disabled:opacity-50`}
            >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">북마크</span>
            </button>
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/10 transition-colors"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">공유</span>
            </button>
        </div>
    );
}
