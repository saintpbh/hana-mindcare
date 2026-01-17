"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, MessageSquare, Heart, Share2, MoreHorizontal, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Mock Data
interface Post {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    authorRole: string;
    category: string;
    likes: number;
    comments: number;
    timeAgo: string;
    isHot?: boolean;
}

const POSTS: Post[] = [
    {
        id: "1",
        title: "청소년 내담자 라포 형성 팁 공유합니다",
        excerpt: "최근 10대 후반 내담자와의 상담에서 게임을 주제로 대화를 시작하니 마음을 여는 데 큰 도움이 되었습니다. 다른 분들은 어떤 주제를 주로 활용하시나요?",
        author: "김민지 상담사",
        authorRole: "임상심리사",
        category: "상담 팁 (Tips)",
        likes: 24,
        comments: 8,
        timeAgo: "2시간 전",
        isHot: true
    },
    {
        id: "2",
        title: "불면증 CBT-I 적용 시 어려움이 있어요",
        excerpt: "수면 제한 요법을 힘들어하는 내담자분들을 어떻게 격려하면 좋을까요? 순응도를 높이기 위한 노하우가 있다면 공유 부탁드립니다.",
        author: "이준호 원장",
        authorRole: "정신건강의학과 전문의",
        category: "케이스 스터디 (Case Study)",
        likes: 15,
        comments: 12,
        timeAgo: "5시간 전"
    },
    {
        id: "3",
        title: "다음 달 학회 일정 정리 (KPA)",
        excerpt: "한국심리학회 연차학술대회 사전등록이 다음 주까지입니다. 주요 세션 정보 정리해서 올립니다. 관심 있으신 분들 참고하세요.",
        author: "박서연",
        authorRole: "상담심리사",
        category: "정보 공유 (Info)",
        likes: 42,
        comments: 5,
        timeAgo: "1일 전",
        isHot: true
    },
    {
        id: "4",
        title: "번아웃 증후군 자가 진단 도구 추천",
        excerpt: "직장인 내담자분들에게 가볍게 적용해볼 수 있는 신뢰도 높은 척도가 있을까요? MBI 말고 다른 도구들도 써보고 싶습니다.",
        author: "최현우",
        authorRole: "기업 상담 전문가",
        category: "자료 요청 (Resources)",
        likes: 8,
        comments: 3,
        timeAgo: "1일 전"
    },
    {
        id: "5",
        title: "개업 초기 마케팅 경험담 나눕니다",
        excerpt: "블로그나 인스타그램 외에 지역 커뮤니티와의 연계가 실제로 얼마나 효과가 있었는지, 제 경험을 바탕으로 몇 자 적어봅니다.",
        author: "정수진",
        authorRole: "센터장",
        category: "운영/경영 (Practice)",
        likes: 56,
        comments: 21,
        timeAgo: "3일 전",
        isHot: true
    }
];

const CATEGORIES = ["전체", "상담 팁", "케이스 스터디", "정보 공유", "자료 요청", "운영/경영", "자유 수다"];

export default function CommunityPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");

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
                    <button className="h-10 px-5 rounded-full bg-[var(--color-midnight-navy)] text-white text-sm font-medium hover:bg-[var(--color-midnight-navy)]/90 transition-colors flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20">
                        <Plus className="w-4 h-4" />
                        새 글 쓰기
                    </button>
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

                        {/* Trending Tags */}
                        <div className="bg-white rounded-2xl p-4 border border-[var(--color-midnight-navy)]/5 shadow-sm">
                            <h3 className="text-xs font-bold text-[var(--color-midnight-navy)] uppercase tracking-wider mb-3 px-2">인기 태그</h3>
                            <div className="flex flex-wrap gap-2">
                                {["#불면증", "#청소년상담", "#개업준비", "#MMPI", "#슈퍼비전"].map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded-md bg-[var(--color-warm-white)] text-[var(--color-midnight-navy)]/70 text-xs hover:bg-[var(--color-midnight-navy)]/5 cursor-pointer transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Feed Filters */}
                        <div className="flex items-center gap-4 text-sm text-[var(--color-midnight-navy)]/60 border-b border-[var(--color-midnight-navy)]/5 pb-2">
                            <button className="text-[var(--color-midnight-navy)] font-medium">최신순</button>
                            <button className="hover:text-[var(--color-midnight-navy)] transition-colors">인기순</button>
                            <button className="hover:text-[var(--color-midnight-navy)] transition-colors">댓글 많은 순</button>
                        </div>

                        {/* Posts */}
                        <div className="space-y-4">
                            {POSTS.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-2xl border border-[var(--color-midnight-navy)]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] text-xs font-medium">
                                            {post.category}
                                        </span>
                                        {post.isHot && (
                                            <span className="flex items-center gap-1 text-[var(--color-champagne-gold)] text-xs font-bold uppercase tracking-wide">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-champagne-gold)] animate-pulse" />
                                                Hot Topic
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-[var(--color-midnight-navy)] mb-2 group-hover:text-[var(--color-champagne-gold)] transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-[var(--color-midnight-navy)]/70 text-sm mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-[var(--color-midnight-navy)]/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <span>{post.author} · {post.authorRole}</span>
                                            </div>
                                            <span>{post.timeAgo}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                                                <Heart className="w-4 h-4" /> {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1 hover:text-[var(--color-midnight-navy)] transition-colors">
                                                <MessageSquare className="w-4 h-4" /> {post.comments}
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
