import { getSessionDetails } from "@/app/actions/sessions";
import { SessionTabs } from "@/components/sessions/SessionTabs";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string; sessionId: string }>;
}



export const dynamic = 'force-dynamic';

export default async function SessionDetailPage({ params }: PageProps) {
    // Await params first (Next.js 15+ convention usually, though depending on version simple access works)
    // Safe to await.
    const { id, sessionId } = await params;

    const result = await getSessionDetails(sessionId);

    if (!result.success || !result.data) {
        return notFound();
    }

    const session = result.data;
    const clientName = session.client?.name || "Unknown Client";

    return (
        <div className="min-h-screen bg-[var(--color-warm-white)] p-8 overflow-auto">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/patients/${id}`} className="p-2 hover:bg-[var(--color-midnight-navy)]/5 rounded-full transition-colors text-[var(--color-midnight-navy)]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--color-midnight-navy)]/40 uppercase tracking-widest">{clientName}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-midnight-navy)]/20" />
                            <span className="text-xs text-[var(--color-midnight-navy)]/40 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(session.date).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-2xl font-serif text-[var(--color-midnight-navy)]">{session.title}</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto">
                <SessionTabs session={session} />
            </div>
        </div>
    );
}
