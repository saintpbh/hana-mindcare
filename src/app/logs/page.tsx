import { getCounselingLogs } from "@/app/actions/sessions";
import { ArrowLeft, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";


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
                <div className="space-y-8">
                    {Object.entries(
                        logs.reduce((acc: Record<string, any[]>, log: any) => {
                            const date = new Date(log.session.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(log);
                            return acc;
                        }, {} as Record<string, typeof logs>)
                    ).map(([date, groupLogs]: [string, any[]]) => (
                        <div key={date} className="bg-white rounded-xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-[var(--color-midnight-navy)]/5 border-b border-[var(--color-midnight-navy)]/5 font-medium text-[var(--color-midnight-navy)] flex items-center gap-2">
                                <Clock className="w-4 h-4 opacity-50" />
                                {date}
                            </div>
                            <div className="divide-y divide-[var(--color-midnight-navy)]/5">
                                {groupLogs.map((log) => (
                                    <Link
                                        key={log.id}
                                        href={`/patients/${log.session.client.id}/sessions/${log.sessionId}?tab=counseling-log`}
                                        className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 p-4 hover:bg-[var(--color-midnight-navy)]/5 transition-colors items-center text-sm text-[var(--color-midnight-navy)]"
                                    >
                                        <div className="font-medium">{log.session.client.name}</div>
                                        <div className="truncate">{log.session.title}</div>
                                        <div>{log.writerName || "-"}</div>
                                        <div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-xs flex w-fit items-center gap-1",
                                                log.status === "FINAL"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            )}>
                                                {log.status === "FINAL" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {log.status === "FINAL" ? "제출됨" : "작성 중"}
                                            </span>
                                        </div>
                                        <div className="text-[var(--color-midnight-navy)]/60">
                                            {new Date(log.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="p-8 text-center text-[var(--color-midnight-navy)]/40 text-sm bg-white rounded-xl border border-[var(--color-midnight-navy)]/5">
                            데이터가 없습니다.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
