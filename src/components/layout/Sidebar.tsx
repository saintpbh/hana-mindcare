import Link from "next/link";
import { LayoutGrid, Calendar, Users, Settings, BookOpen, MessageSquare, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "대시보드", href: "/", active: true },
    { icon: Users, label: "내담자 관리", href: "/patients" },
    { icon: Calendar, label: "일정 관리", href: "/schedule" },
    { icon: BookOpen, label: "세린 라이브러리", href: "/library" },
    { icon: MessageSquare, label: "커뮤니티", href: "/community" },
    { icon: Settings, label: "설정", href: "/settings" },
];

export function Sidebar() {
    return (
        <aside className="w-20 lg:w-64 bg-[var(--color-midnight-navy)] text-white flex flex-col shrink-0 transition-all duration-300">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-champagne-gold)] to-amber-600 rounded-lg shrink-0" />
                <span className="hidden lg:block ml-3 font-serif text-xl tracking-wide text-[var(--color-warm-white)]">
                    Serene Care
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-8 px-2 lg:px-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl transition-all duration-200 group relative",
                            item.active
                                ? "bg-white/10 text-[var(--color-champagne-gold)]"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5 lg:mr-3", item.active && "text-[var(--color-champagne-gold)]")} />
                        <span className="hidden lg:block text-sm font-medium">{item.label}</span>

                        {/* Active Indicator */}
                        {item.active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-champagne-gold)] rounded-r-full" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 border-2 border-[var(--color-midnight-navy)]" />
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Dr. Sarah Kim</p>
                        <p className="text-xs text-white/40 truncate">임상 심리 전문가</p>
                    </div>
                    <LogOut className="w-4 h-4 text-white/40 ml-auto hidden lg:block hover:text-white" />
                </div>
            </div>
        </aside>
    );
}
