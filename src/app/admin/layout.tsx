import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { Shield, Users, ArrowLeft, LogOut } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireAuth();

    if (!session.user.isSuperAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        <span>Hana Admin</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Platform Management</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white font-medium"
                    >
                        <Users className="w-5 h-5 text-slate-400" />
                        사용자 관리
                    </Link>
                    {/* Placeholder for future features */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 cursor-not-allowed">
                        <span className="w-5 h-5" />
                        통계 (Coming Soon)
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        서비스로 돌아가기
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
