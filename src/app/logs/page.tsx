import { getCounselingLogs } from "@/app/actions/sessions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LogsList } from "@/components/logs/LogsList";


export const dynamic = 'force-dynamic';

export default async function LogsPage() {
    const result = await getCounselingLogs();
    const logs = result.success ? result.data || [] : [];

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8">
            <header className="flex items-center justify-between max-w-5xl mx-auto mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">상담일지 관리</h1>
                        <p className="text-sm text-[var(--color-midnight-navy)]/60">전체 상담 일지 현황 및 결재 관리</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                <LogsList logs={logs} />
            </main>
        </div>
    );
}
