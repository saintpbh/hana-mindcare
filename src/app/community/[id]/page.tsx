import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Bookmark, Share2, MessageSquare, User } from "lucide-react";
import { getPost } from "@/app/actions/community";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { PostDetailClient } from "./PostDetailClient";
import { CommentSection } from "./CommentSection";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const result = await getPost(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const post = result.data;

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/community" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">커뮤니티</h1>
                </header>

                {/* Post */}
                <article className="bg-white rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm p-8 mb-6">
                    {/* Category */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] text-xs font-medium">
                            {post.category}
                        </span>
                        <span className="text-xs text-[var(--color-midnight-navy)]/40">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-[var(--color-midnight-navy)] mb-4">
                        {post.title}
                    </h2>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--color-midnight-navy)]/5">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-[var(--color-midnight-navy)]">
                                {post.isAnonymous ? "익명" : post.authorName}
                            </div>
                            {!post.isAnonymous && post.authorRole && (
                                <div className="text-xs text-[var(--color-midnight-navy)]/50">
                                    {post.authorRole}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose max-w-none mb-8">
                        {post.content.split('\n').map((line, i) => (
                            <p key={i} className="text-[var(--color-midnight-navy)]/80 leading-relaxed mb-4">
                                {line || <br />}
                            </p>
                        ))}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/70 text-xs">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <PostDetailClient postId={post.id} initialLikeCount={post._count.likes} />
                </article>

                {/* Comments Section - Import from client component */}
                <CommentSection postId={post.id} initialComments={post.comments || []} />
            </div>
        </div>
    );
}
