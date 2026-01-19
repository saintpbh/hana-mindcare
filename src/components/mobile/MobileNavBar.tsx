"use client";

import { Home, MessageSquare, BookOpen, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "insights" | "library" | "messages" | "profile";

interface MobileNavBarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function MobileNavBar({ activeTab, onTabChange }: MobileNavBarProps) {
    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: "home", label: "홈", icon: Home },
        { id: "insights", label: "변화", icon: TrendingUp },
        { id: "library", label: "라이브러리", icon: BookOpen },
        { id: "messages", label: "메시지", icon: MessageSquare },
        { id: "profile", label: "기타", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[var(--color-midnight-navy)]/5 px-6 pb-8 pt-4 flex justify-between items-center max-w-md mx-auto z-50">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all",
                        activeTab === tab.id
                            ? "text-[var(--color-midnight-navy)] scale-110"
                            : "text-[var(--color-midnight-navy)]/30 hover:text-[var(--color-midnight-navy)]/60"
                    )}
                >
                    <tab.icon className={cn("w-6 h-6", activeTab === tab.id && "fill-current/10")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && (
                        <div className="w-1 h-1 rounded-full bg-[var(--color-midnight-navy)] mt-0.5" />
                    )}
                </button>
            ))}
        </nav>
    );
}
