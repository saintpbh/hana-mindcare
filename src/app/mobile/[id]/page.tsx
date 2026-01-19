import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MobileClientLayout } from "@/components/mobile/MobileClientLayout";

export const dynamic = 'force-dynamic';

export default async function MobileClientPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            sessions: {
                where: { status: 'Scheduled' },
                orderBy: { date: 'asc' },
                take: 1
            }
        }
    });

    if (!client) {
        notFound();
    }

    const nextSession = client.sessions[0];

    return <MobileClientLayout client={client} nextSession={nextSession} />;
}
