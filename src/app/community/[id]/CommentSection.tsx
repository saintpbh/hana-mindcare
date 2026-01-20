"use client";

import { useState } from "react";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { createComment } from "@/app/actions/community";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
    id: string;
    content: string;
    authorName: string | null;
    authorRole: string | null;
    createdAt: Date;
    replies?: Comment[];
}

interface CommentSectionProps {
    postId: string;
    initialComments: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        const result = await createComment({
            postId,
            content: newComment.trim(),
            authorId: "temp-user-id", // TODO: Get from auth
            authorName: "김상담", // TODO: Get from auth
            authorRole: "임상심리사" // TODO: Get from auth
        });

        if (result.success && result.data) {
            // Add new comment to the list
            setComments([result.data as any, ...comments]);
            setNewComment("");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm p-8">
            <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                댓글 {comments.length}
            </h3>

            {/* Comment Form */}
            <div className="mb-8">
                <textarea
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-lg border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)] resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        className="px-4 py-2 rounded-lg bg-[var(--color-midnight-navy)] text-white text-sm hover:bg-[var(--color-midnight-navy)]/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                작성 중...
                            </>
                        ) : (
                            "댓글 작성"
                        )}
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="border-l-2 border-[var(--color-midnight-navy)]/5 pl-4">
                            <div className="flex items-start gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-[var(--color-midnight-navy)]">
                                            {comment.authorName || "익명"}
                                        </span>
                                        <span className="text-xs text-[var(--color-midnight-navy)]/40">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-midnight-navy)]/70">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 ml-8 space-y-4">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-[var(--color-midnight-navy)]">
                                                        {reply.authorName || "익명"}
                                                    </span>
                                                    <span className="text-xs text-[var(--color-midnight-navy)]/40">
                                                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ko })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[var(--color-midnight-navy)]/70">
                                                    {reply.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-[var(--color-midnight-navy)]/40 py-8">
                        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </p>
                )}
            </div>
        </div>
    );
}
