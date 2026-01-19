"use client";

import { useState } from "react";
import { Clock, CheckCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogDetailModal } from "./LogDetailModal";

interface LogsListProps {
    logs: any[];
}

export function LogsList({ logs }: LogsListProps) {
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Group logs by date (formatting handled in render to match previous behavior logic but cleaner)
    const groupedLogs = logs.reduce((acc: Record<string, any[]>, log: any) => {
        const date = new Date(log.session.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, typeof logs>);

    const handleLogClick = (log: any) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="space-y-8">
                {Object.entries(groupedLogs).map(([date, groupLogs]: [string, any[]]) => (
                    <div key={date} className="bg-white rounded-xl border border-[var(--color-midnight-navy)]/5 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-[var(--color-midnight-navy)]/5 border-b border-[var(--color-midnight-navy)]/5 font-medium text-[var(--color-midnight-navy)] flex items-center gap-2">
                            <Clock className="w-4 h-4 opacity-50" />
                            {date}
                        </div>
                        <div className="divide-y divide-[var(--color-midnight-navy)]/5">
                            {groupLogs.map((log) => (
                                <button
                                    key={log.id}
                                    onClick={() => handleLogClick(log)}
                                    className="w-full text-left grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 p-4 hover:bg-[var(--color-midnight-navy)]/5 transition-colors items-center text-sm text-[var(--color-midnight-navy)]"
                                >
                                    <div className="font-medium">{log.session.client.name}</div>
                                    <div className="truncate text-[var(--color-midnight-navy)]/80">{log.session.title}</div>
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
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-[var(--color-midnight-navy)]/40 bg-white rounded-xl border border-[var(--color-midnight-navy)]/5">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-medium">등록된 상담 일지가 없습니다.</p>
                    </div>
                )}
            </div>

            <LogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </>
    );
}
