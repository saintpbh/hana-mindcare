import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MobileClientLayout } from "@/components/mobile/MobileClientLayout";

import { updateLastPortalAccess } from "@/app/actions/portal";

export const dynamic = 'force-dynamic';

export default async function MobileClientPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Search by ID first (legacy and standard)
    let client = await prisma.client.findUnique({
        where: { id },
        include: {
            sessions: {
                where: { status: 'Scheduled' },
                orderBy: { date: 'asc' },
                take: 1
            }
        }
    });

    // If not found, try by portalToken (new secure links)
    // We wrap this in a try-catch in case the Prisma Client cache is stale
    if (!client) {
        try {
            client = await (prisma.client as any).findFirst({
                where: { portalToken: id },
                include: {
                    sessions: {
                        where: { status: 'Scheduled' },
                        orderBy: { date: 'asc' },
                        take: 1
                    }
                }
            });
        } catch (e) {
            console.error("Portal token lookup failed (possibly stale Prisma cache):", e);
        }
    }

    if (!client) {
        notFound();
    }

    // Security Check: Is Portal Active?
    if (!client.isPortalActive) {
        return (
            <div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center p-8 text-center">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-xl font-serif text-[var(--color-midnight-navy)]">접근이 제한되었습니다</h1>
                    <p className="text-sm text-gray-500">정보 보호를 위해 현재 상담사님이 접근을 제한한 상태입니다. 센터로 문의 부탁드립니다.</p>
                </div>
            </div>
        );
    }

    // Track Access
    if (client.portalToken) {
        await updateLastPortalAccess(client.portalToken);
    }

    const nextSession = client.sessions[0];

    return <MobileClientLayout client={client} nextSession={nextSession} />;
}
