import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await requireAuth();

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count today's scheduled sessions
        const count = await prisma.session.count({
            where: {
                accountId: session.accountId,
                status: 'Scheduled',
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Failed to fetch today session count:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
