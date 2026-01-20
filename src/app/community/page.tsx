"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MessageSquare, Heart, Plus, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getPosts } from "@/app/actions/community";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string | null;
    authorRole: string | null;
    isAnonymous: boolean;
    createdAt: Date;
    _count: {
        likes: number;
        comments: number;
    };
}

const CATEGORIES = ["전체", "상담 팁", "케이스 스터디", "정보 공유", "자료 요청", "운영/경영", "자유 수다"];

export default function CommunityPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, sortBy]);

    const fetchPosts = async () => {
        setIsLoading(true);
        const result = await getPosts({
            category: selectedCategory,
            searchQuery: searchQuery || undefined,
            sortBy: sortBy,
            limit: 20
        });

        if (result.success && result.data) {
            setPosts(result.data as any);
        }
        setIsLoading(false);
    };

    const handleSearch = () => {
        fetchPosts();
    };

    const getTimeAgo = (date: Date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
    };

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">전문가 커뮤니티</h1>
                            <p className="text-sm text-[var(--color-midnight-navy)]/60">동료 상담사들과 인사이트를 나누고 소통하세요.</p>
                        </div>
                    </div>
                    <Link href="/community/new">
                        <button className="h-10 px-5 rounded-full bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20">
                            <Plus className="w-4 h-4" />
                            새 글 쓰기
                        </button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Filters */}
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-midnight-navy)]/40" />
                            <input
                                type="text"
                                placeholder="토픽 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[var(--color-midnight-navy)]/10 text-sm focus:outline-none focus:border-[var(--color-midnight-navy)] transition-colors"
                            />
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl p-4 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-3 px-2">주제별 보기</h3>
                            <div className="space-y-1">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                            selectedCategory === cat
                                                ? "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] font-medium"
                                                : "text-[var(--color-midnight-navy)]/60 hover:bg-[var(--color-midnight-navy)]/5 hover:text-[var(--color-midnight-navy)]"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-2xl p-4 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-3 px-2">커뮤니티 통계</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between px-2">
                                    <span className="text-[var(--color-midnight-navy)]/60">전체 게시글</span>
                                    <span className="font-medium text-[var(--color-midnight-navy)]">{posts.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Feed Filters */}
                        <div className="flex items-center gap-4 text-sm text-[var(--color-midnight-navy)]/60 border-b border-[var(--color-midnight-navy)]/5 pb-2">
                            <button
                                onClick={() => setSortBy('latest')}
                                className={cn(
                                    "transition-colors",
                                    sortBy === 'latest' ? "text-[var(--color-midnight-navy)] font-medium" : "hover:text-[var(--color-midnight-navy)]"
                                )}
                            >
                                최신순
                            </button>
                            <button
                                onClick={() => setSortBy('popular')}
                                className={cn(
                                    "transition-colors",
                                    sortBy === 'popular' ? "text-[var(--color-midnight-navy)] font-medium" : "hover:text-[var(--color-midnight-navy)]"
                                )}
                            >
                                인기순
                            </button>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="text-center py-12 text-[var(--color-midnight-navy)]/40">
                                로딩 중...
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && posts.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-[var(--color-midnight-navy)]/40 mb-4">게시글이 없습니다.</p>
                                <Link href="/community/new">
                                    <button className="px-4 py-2 bg-[var(--color-midnight-navy)] text-white rounded-lg text-sm hover:bg-[var(--color-midnight-navy)]/90">
                                        첫 게시글 작성하기
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Posts */}
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => router.push(`/community/${post.id}`)}
                                    className="bg-white p-6 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] text-xs font-medium">
                                            {post.category}
                                        </span>
                                        {post._count.likes > 10 && (
                                            <span className="flex items-center gap-1 text-[var(--color-champagne-gold)] text-xs font-bold uppercase tracking-wide">
                                                <TrendingUp className="w-3 h-3" />
                                                인기
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-2 group-hover:text-[var(--color-champagne-gold)] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-[var(--color-midnight-navy)]/70 text-sm mb-4 line-clamp-2">
                                        {post.content.substring(0, 150)}...
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-[var(--color-midnight-navy)]/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <span>
                                                    {post.isAnonymous ? "익명" : `${post.authorName} · ${post.authorRole}`}
                                                </span>
                                            </div>
                                            <span>{getTimeAgo(post.createdAt)}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                                                <Heart className="w-4 h-4" /> {post._count.likes}
                                            </span>
                                            <span className="flex items-center gap-1 hover:text-[var(--color-midnight-navy)] transition-colors">
                                                <MessageSquare className="w-4 h-4" /> {post._count.comments}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
