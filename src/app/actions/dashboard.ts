'use server';

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getDashboardData() {
    const session = await requireAuth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    try {
        // 1. Intelligent Briefing Data
        // - Crisis/Attention clients
        // - Intake clients (tag based)
        const briefingClients = await prisma.client.findMany({
            where: {
                accountId: session.accountId,
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
                accountId: session.accountId,
                nextSession: todayStr,
                isSessionCanceled: false
            },
            orderBy: { sessionTime: 'asc' }
        });

        // 3. Recent Signals (Aggregated from Sessions, Moods, and Homework)
        const recentSessions = await prisma.session.findMany({
            where: { accountId: session.accountId },
            take: 3,
            orderBy: { date: 'desc' },
            include: { client: true }
        });

        const recentMoods = await prisma.mood.findMany({
            where: {
                client: { accountId: session.accountId }
            },
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: { client: true }
        });

        const recentHomework = await prisma.prescription.findMany({
            where: {
                isCompleted: true,
                type: 'homework',
                client: { accountId: session.accountId }
            },
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: { client: true }
        });

        // specific type mapping for UI
        const signals = [
            ...recentSessions.map((s: any) => ({
                id: s.clientId,
                type: 'log',
                user: s.client.name,
                content: `상담 노트 생성: ${s.title}`,
                time: new Date(s.date).toLocaleDateString(),
                rawDate: s.date
            })),
            ...recentMoods.map((m: any) => ({
                id: m.clientId,
                type: 'mood',
                user: m.client.name,
                content: `기분 기록: ${m.score === 3 ? '좋음' : m.score === 1 ? '힘듦' : '평범'} - "${m.note || ''}"`,
                time: new Date(m.createdAt).toLocaleDateString(),
                rawDate: m.createdAt
            })),
            ...recentHomework.map((h: any) => ({
                id: h.clientId,
                type: 'homework',
                user: h.client.name,
                content: `과제 완료: ${h.title}`,
                time: new Date(h.createdAt).toLocaleDateString(),
                rawDate: h.createdAt
            }))
        ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()).slice(0, 5);

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
