import { Search, Plus, UserCircle, Settings, LogOut, ChevronDown, UserCog, Users, StickyNote } from "lucide-react";
import { useUserRole, UserRole } from "@/contexts/UserRoleContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Header() {
    const { role, setRole } = useUserRole();
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const roleLabels: Record<UserRole, string> = {
        'counselor': '상담사 모드',
        'admin': '행정 관리자',
        'solo': '1인 원장님'
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">
                        Good Morning, Dr. Park
                    </h1>
                    <p className="text-sm text-neutral-500">You have 3 sessions today</p>
                </div>

                {/* Role Switcher (Demo Feature) */}
                <div className="relative">
                    <button
                        onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-600 flex items-center gap-2 transition-colors"
                    >
                        {role === 'counselor' && <UserCircle className="w-3 h-3" />}
                        {role === 'admin' && <Users className="w-3 h-3" />}
                        {role === 'solo' && <UserCog className="w-3 h-3" />}
                        {roleLabels[role]}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    {isRoleMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsRoleMenuOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 p-1 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            setRole(r);
                                            setIsRoleMenuOpen(false);
                                        }}
                                        className={cn(
                                            "px-4 py-2.5 text-left text-sm rounded-lg transition-colors flex items-center gap-3",
                                            role === r ? "bg-[var(--color-midnight-navy)]/5 text-[var(--color-midnight-navy)] font-medium" : "hover:bg-neutral-50 text-neutral-600"
                                        )}
                                    >
                                        {r === 'counselor' && <UserCircle className="w-4 h-4 opacity-70" />}
                                        {r === 'admin' && <Users className="w-4 h-4 opacity-70" />}
                                        {r === 'solo' && <UserCog className="w-4 h-4 opacity-70" />}
                                        {roleLabels[r]}
                                    </button>
                                ))}
                                <div className="border-t border-neutral-100 my-1 mx-2" />
                                <div className="px-3 py-2 text-[10px] text-neutral-400 leading-tight">
                                    * 데모를 위해 역할을 전환해보세요. 대시보드 구성이 달라집니다.
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Global Action Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        className="h-10 px-4 bg-[var(--color-midnight-navy)] text-white rounded-full flex items-center gap-2 shadow-lg shadow-[var(--color-midnight-navy)]/20 hover:scale-105 active:scale-95 transition-all text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">빠른 작업</span>
                    </button>

                    {isActionMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 flex flex-col animate-in slide-in-from-top-2 duration-200 origin-top-right">
                                <Link
                                    href="/schedule?intake=true" // Query param to trigger intake
                                    onClick={() => setIsActionMenuOpen(false)}
                                    className="px-4 py-3 text-left text-sm rounded-xl hover:bg-neutral-50 text-neutral-700 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">신규 내담자 등록</div>
                                        <div className="text-[10px] text-neutral-400">간편 접수 마법사</div>
                                    </div>
                                </Link>
                                <Link
                                    href="/schedule?new=true"
                                    onClick={() => setIsActionMenuOpen(false)}
                                    className="px-4 py-3 text-left text-sm rounded-xl hover:bg-neutral-50 text-neutral-700 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">상담 일정 예약</div>
                                        <div className="text-[10px] text-neutral-400">캘린더 바로가기</div>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => setIsActionMenuOpen(false)}
                                    className="px-4 py-3 text-left text-sm rounded-xl hover:bg-neutral-50 text-neutral-700 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <StickyNote className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">빠른 메모 작성</div>
                                        <div className="text-[10px] text-neutral-400">대시보드 위젯</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="h-10 pl-10 pr-4 rounded-full bg-white border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-midnight-navy)]/10 w-64 transition-all focus:w-72"
                    />
                </div>

                <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--color-midnight-navy)]/20 transition-all">
                    {/* Placeholder for user avatar */}
                    <div className="w-full h-full bg-[var(--color-midnight-navy)] flex items-center justify-center text-white font-medium text-sm">
                        DP
                    </div>
                </div>
            </div>
        </header>
    );
}
