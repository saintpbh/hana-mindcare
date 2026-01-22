"use client";

import { useState, useEffect } from "react";
import { getAdminStats, getAllUsers, updateUserStatus, promoteToSuperAdmin } from "@/app/actions/admin";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, Shield, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // DEV ONLY: State to handle self-promotion if not admin yet (though layout protects this, useful for testing flow if protection was looser or for initial setup)
    const [isDevMode, setIsDevMode] = useState(false);

    const loadData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                getAdminStats(),
                getAllUsers(1, 100, searchTerm)
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (usersRes.success) setUsers(usersRes.data.users);
        } catch (error: any) {
            console.error("Failed to load admin data", error);
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [searchTerm]);

    const handleStatusToggle = async (userId: string, currentStatus: boolean, name: string) => {
        if (!confirm(`${name}님의 상태를 ${currentStatus ? '미승인' : '승인'}으로 변경하시겠습니까?`)) return;

        const res = await updateUserStatus(userId, !currentStatus);
        if (res.success) {
            loadData(); // Refresh
        }
    };

    const handleBecomeSuperAdmin = async () => {
        if (session?.user?.email) {
            await promoteToSuperAdmin(session.user.email);
            window.location.reload();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error} <br /><button onClick={() => window.location.reload()} className="mt-4 underline">Retry</button></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">사용자 관리</h1>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-500">
                        Total: {stats?.totalUsers}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-sm font-medium text-emerald-600">
                        Approved: {stats?.approvedUsers}
                    </span>
                    <span className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-sm font-medium text-amber-600">
                        Pending: {stats?.pendingUsers}
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="이름, 이메일 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">User</th>
                            <th className="px-6 py-4 font-semibold">Account Type</th>
                            <th className="px-6 py-4 font-semibold">Joined At</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                                            {user.name?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 flex items-center gap-2">
                                                {user.name}
                                                {user.isSuperAdmin && <Shield className="w-3 h-3 text-emerald-500" />}
                                            </div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">
                                        Personal
                                        {/* Logic to show org memberships if any could go here */}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">
                                        {format(new Date(user.createdAt), 'yyyy. MM. dd', { locale: ko })}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                                            <XCircle className="w-3 h-3" />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!user.isSuperAdmin && (
                                        <button
                                            onClick={() => handleStatusToggle(user.id, user.isApproved, user.name)}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${user.isApproved
                                                ? "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm"
                                                }`}
                                        >
                                            {user.isApproved ? "Suspend" : "Approve"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No users found.
                    </div>
                )}
            </div>

            {/* Hidden Dev Tool */}
            <div className="mt-12 p-4 border border-dashed border-gray-300 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-500 mb-2 font-mono">Developer Options (Remove in Prod)</p>
                <button
                    onClick={handleBecomeSuperAdmin}
                    className="px-4 py-2 bg-slate-800 text-white text-xs rounded hover:bg-slate-900"
                >
                    Promote Current User to Super Admin
                </button>
            </div>
        </div>
    );
}
