import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { MOCK_CLIENTS } from '../src/data/mockClients'
import "dotenv/config"; // Ensure .env is loaded

const connectionString = process.env.POSTGRES_PRISMA_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding...')

    // Clear existing data
    // await prisma.session.deleteMany();
    // await prisma.client.deleteMany();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Helper to get relative date string
    const getRelDate = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    // Helper to generate mock sessions
    const generateSessions = () => {
        const sentiments = ['Positive', 'Neutral', 'Negative', 'Neutral'];
        const topics = [
            { title: "초기 면담", summary: "내담자의 주 호소 문제 파악 및 라포 형성. 수면 장애와 관련된 초기 증상 확인.", keywords: ["수면", "초기면담", "스트레스"] },
            { title: "CBT 세션 1", summary: "인지행동치료 도입. 자동적 사고에 대한 설명 및 식별 연습.", keywords: ["CBT", "인지오류", "불안"] },
            { title: "스트레스 관리", summary: "직무 스트레스 원인 분석 및 대처 방안 모색. '잠시 멈춤' 기법 훈련.", keywords: ["직무스트레스", "대처", "이완"] },
            { title: "정기 상담", summary: "지난 한 주간의 기분 변화 점검. 수면 패턴이 다소 불규칙했으나 전반적으로 안정적임.", keywords: ["기분점검", "생활리듬"] }
        ];

        // Generate 2-4 past sessions
        const count = Math.floor(Math.random() * 3) + 2;
        return Array.from({ length: count }).map((_, i) => {
            const topic = topics[i % topics.length];
            // Date: -7 * (i+1) days ago
            const d = new Date(today);
            d.setDate(d.getDate() - (7 * (count - i))); // Order: oldest first

            return {
                date: d,
                title: topic.title,
                summary: topic.summary,
                sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
                keywords: topic.keywords
            };
        });
    };

    // 1. Create specific demo scenarios
    const demoClients = [
        // [Today's Flow] 10:00 AM (Completed?)
        {
            ...MOCK_CLIENTS[0],
            name: "이민준",
            status: "stable",
            nextSession: todayStr,
            sessionTime: "10:00",
            condition: "수면 장애",
        },
        // [Today's Flow] 14:00 PM (Current/Next)
        {
            ...MOCK_CLIENTS[1],
            name: "박지은",
            status: "attention",
            tags: ["intake"], // For Briefing
            nextSession: todayStr,
            sessionTime: "14:00",
            condition: "직무 스트레스",
        },
        // [Today's Flow] 16:30 PM (Upcoming)
        {
            ...MOCK_CLIENTS[2],
            name: "최현수",
            status: "stable",
            nextSession: todayStr,
            sessionTime: "16:30",
            condition: "우울증",
        },
        // [Briefing] Crisis Client
        {
            ...MOCK_CLIENTS[3],
            name: "김영희",
            status: "crisis",
            nextSession: getRelDate(2),
            sessionTime: "11:00",
            condition: "공황 장애",
            notes: "지난 밤 응급실 방문 이력 있음. 수면 패턴 붕괴.",
        },
        // [Signals] Recently Updated
        {
            ...MOCK_CLIENTS[4],
            name: "정우성",
            status: "stable",
            updatedAt: new Date(today.getTime() - 1000 * 60 * 10), // 10 mins ago
            notes: "기분 일지 업데이트: '오늘 좀 괜찮음'",
        }
    ];

    // Combine demo + filler
    const allClients = [
        ...demoClients,
        ...MOCK_CLIENTS.slice(5) // Filler
    ];

    for (const client of allClients) {
        const { id, createdAt, updatedAt, ...data } = client as any;

        await prisma.client.create({
            data: {
                ...data,
                englishName: data.englishName || null,
                location: data.location || null,
                isSessionCanceled: data.isSessionCanceled || false,
                updatedAt: data.updatedAt || undefined,
                // Nested create for sessions
                sessions: {
                    create: generateSessions()
                }
            }
        });
    }

    console.log(`Seeded ${allClients.length} clients with realistic session history.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
