'use server';

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    try {
        // 1. Intelligent Briefing Data
        // - Crisis/Attention clients
        // - Intake clients (tag based)
        const briefingClients = await prisma.client.findMany({
            where: {
                OR: [
                    { status: { in: ['crisis', 'attention'] } },
                    { tags: { has: 'intake' } }
                ]
            },
            take: 3,
            orderBy: { updatedAt: 'desc' }
        });

        // 2. Today's Flow Data
        const todaySessions = await prisma.client.findMany({
            where: {
                nextSession: todayStr,
                isSessionCanceled: false
            },
            orderBy: { sessionTime: 'asc' }
        });

        // 3. Recent Signals (Aggregated from Sessions and Client updates)
        const recentSessions = await prisma.session.findMany({
            take: 3,
            orderBy: { date: 'desc' },
            include: { client: true }
        });

        const recentClientUpdates = await prisma.client.findMany({
            take: 2,
            orderBy: { updatedAt: 'desc' },
            where: {
                NOT: {
                    sessions: { some: { date: { gte: today } } } // Avoid dupes if session update caused client update
                }
            }
        });

        // specific type mapping for UI
        const signals = [
            ...recentSessions.map(s => ({
                id: s.clientId,
                type: 'log',
                user: s.client.name,
                content: `상담 노트 생성: ${s.title} - ${s.sentiment}`,
                time: new Date(s.date).toLocaleDateString(),
                rawDate: s.date
            })),
            ...recentClientUpdates.map(c => ({
                id: c.id,
                type: 'message', // Simulating a message/update
                user: c.name,
                content: `상태 업데이트: ${c.status === 'crisis' ? '위기 상태 감지' : '특이사항 기록됨'}`,
                time: new Date(c.updatedAt).toLocaleDateString(),
                rawDate: c.updatedAt
            }))
        ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()).slice(0, 4);

        return {
            briefing: briefingClients,
            timeline: todaySessions,
            signals: signals
        };
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        return {
            briefing: [],
            timeline: [],
            signals: []
        };
    }
}
