import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { MOCK_CLIENTS } from '../src/data/mockClients'
import "dotenv/config";

const connectionString = process.env.POSTGRES_PRISMA_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper to add days
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Helper to set time
const setTime = (date: Date, hour: number, minute: number = 0) => {
    const result = new Date(date);
    result.setHours(hour, minute, 0, 0);
    return result;
};

async function main() {
    console.log('🌱 Start seeding...');

    // 1. Clean up
    console.log('🧹 Clearing existing data...');
    await prisma.counselingLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.quickNote.deleteMany();
    await prisma.client.deleteMany();
    await prisma.location.deleteMany();
    await prisma.systemSetting.deleteMany();

    // 2. Locations
    console.log('📍 Seeding locations...');
    const locations = ['양재 센터', '선릉 센터', '논현 센터', '강남 센터', 'Zoom (화상)', 'Phone (전화)'];
    for (const loc of locations) {
        await prisma.location.create({ data: { name: loc } });
    }

    // ... (Settings skipped) ...

    // 4. Counselors (NEW)
    console.log('🧑‍⚕️ Seeding counselors...');
    const counselorData = [
        { name: '김하나', nickname: 'Hana', birthYear: '1985', gender: '여성', qualifications: ['임상심리전문가', '정신건강임상심리사 1급'], specialties: ['불안', '우울', '트라우마'], residence: '서울 강남구', phoneNumber: '010-1234-5678' },
        { name: '이마음', nickname: 'Mind', birthYear: '1980', gender: '남성', qualifications: ['상담심리사 1급'], specialties: ['청소년', '중독'], residence: '서울 서초구', phoneNumber: '010-9876-5432' },
        { name: '박공감', nickname: 'Empathy', birthYear: '1990', gender: '여성', qualifications: ['임상심리전문가'], specialties: ['부부상담', '가족상담'], residence: '경기 성남시', phoneNumber: '010-1111-2222' }
    ];

    const createdCounselors = [];
    for (const c of counselorData) {
        const created = await prisma.counselor.create({ data: c });
        createdCounselors.push(created);
    }

    // 5. Clients & Sessions
    console.log('👥 Seeding clients & sessions...');

    // Expand mock clients to get more volume (~30 clients)
    const expandedClients = [
        ...MOCK_CLIENTS,
        ...MOCK_CLIENTS.map(c => ({ ...c, name: c.name + " (B)", id: c.id + "_b", contact: "010-0000-0000" })),
        ...MOCK_CLIENTS.map(c => ({ ...c, name: c.name + " (C)", id: c.id + "_c", contact: "010-9999-9999" })),
    ].slice(0, 25);

    const today = new Date();

    for (const [index, mock] of expandedClients.entries()) {
        const { id, createdAt, updatedAt, sessions, ...clientData } = mock as any;

        // Randomize status slightly for variety
        const statusPool = ['stable', 'stable', 'attention', 'attention', 'crisis'];
        const status = statusPool[index % statusPool.length];

        // Assign a random counselor
        const assignedCounselor = createdCounselors[Math.floor(Math.random() * createdCounselors.length)];

        const createdClient = await prisma.client.create({
            data: {
                name: clientData.name,
                englishName: clientData.englishName,
                age: clientData.age,
                gender: clientData.gender,
                condition: clientData.condition,
                status: status, // Use varied status
                counselorId: assignedCounselor.id, // Link to counselor
                lastSession: clientData.lastSession || new Date().toISOString(),
                nextSession: clientData.nextSession || new Date().toISOString(),
                sessionTime: clientData.sessionTime || "10:00",
                sessionType: index % 3 === 0 ? "online" : "in-person",
                location: locations[index % locations.length],
                isSessionCanceled: false,
                tags: clientData.tags || [],
                notes: clientData.notes || "",
                contact: clientData.contact || "010-1234-5678",
            }
        });

        // Generate Sessions for this client

        // A. Past Sessions (Completed with Logs) - 1 to 5 sessions
        const pastCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 1; i <= pastCount; i++) {
            const date = setTime(addDays(today, - (i * 7)), 10 + (index % 8)); // Weekly past
            await prisma.session.create({
                data: {
                    clientId: createdClient.id,
                    date: date,
                    title: `상담 ${pastCount - i + 1}회차`,
                    type: "상담",
                    status: "Completed",
                    duration: 50,
                    summary: `${i}주 전 진행된 상담입니다. 내담자의 상태가 점진적으로 ${i % 2 === 0 ? '호전' : '유지'}되고 있습니다.`,
                    sentiment: i % 3 === 0 ? "Positive" : "Neutral",
                    keywords: ["회복", "적응", "스트레스"],
                    counselingLog: {
                        create: {
                            type: "SOAP",
                            status: "FINAL",
                            subjective: "최근 수면 패턴이 개선되었다고 보고함.",
                            objective: "내담자의 표정이 밝고 목소리 톤이 안정적임.",
                            assessment: "초기에 비해 불안 수준이 유의미하게 감소함.",
                            plan: "다음 회기까지 이완 훈련 매일 1회 실시 과제 부여."
                        }
                    }
                }
            });
        }

        // B. Future Sessions (Scheduled) - 1 to 4 sessions
        const futureCount = Math.floor(Math.random() * 4) + 1;
        for (let i = 1; i <= futureCount; i++) {
            const date = setTime(addDays(today, (i * 7)), 10 + (index % 8)); // Weekly future
            // Weekends check? simple skip for now
            if (date.getDay() === 0) date.setDate(date.getDate() + 1);
            if (date.getDay() === 6) date.setDate(date.getDate() + 2);

            const isOnline = i % 2 === 0; // Mix types

            await prisma.session.create({
                data: {
                    clientId: createdClient.id,
                    counselorId: assignedCounselor.id,
                    date: date,
                    title: `상담 ${pastCount + i}회차`,
                    type: isOnline ? "online" : "in-person",
                    status: "Scheduled",
                    duration: 50,
                    recurring: "Weekly",
                    location: isOnline ? "Zoom (화상)" : "양재 센터",
                    meetingLink: isOnline ? "https://zoom.us/j/mock-link-123" : null,
                }
            });
        }

        // C. Dense "Demo" Sessions for Current Month (To make calendar look full)
        // Add extra random sessions in Jan/Feb
        const randomSessionCount = Math.floor(Math.random() * 3); // 0-2 extra sessions per client
        for (let k = 0; k < randomSessionCount; k++) {
            // Random day within +/- 15 days of today
            const offset = Math.floor(Math.random() * 30) - 15;
            const demoDate = setTime(addDays(today, offset), 9 + Math.floor(Math.random() * 9)); // 9am - 6pm

            // Avoid duplicates crudely
            await prisma.session.create({
                data: {
                    clientId: createdClient.id,
                    counselorId: assignedCounselor.id,
                    date: demoDate,
                    title: `상담 (추가)`,
                    type: Math.random() > 0.5 ? "online" : "in-person",
                    status: "Scheduled",
                    duration: 50,
                    location: Math.random() > 0.5 ? "Zoom (화상)" : "양재 센터",
                }
            });
        }

        // D. Ensure "Today" has some sessions (for demo impact)
        // Arbitrarily add a session today for the first few clients
        if (index < 5) { // First 5 clients get a session today
            const todayTime = 10 + (index * 2); // 10, 12, 14, 16, 18
            const todayDate = setTime(new Date(), todayTime);
            await prisma.session.create({
                data: {
                    clientId: createdClient.id,
                    date: todayDate,
                    title: `[긴급] 정기 상담`,
                    type: "in-person",
                    status: "Scheduled",
                    duration: 50,
                }
            });
        }

        // C. TODAY'S Sessions (Specific for specific clients to fill Dashboard)
        if (index < 5) {
            const hours = [9, 11, 14, 16, 18];
            const sessionDate = setTime(today, hours[index]);

            await prisma.session.create({
                data: {
                    clientId: createdClient.id,
                    date: sessionDate,
                    title: `정기 상담 (오늘)`,
                    type: index === 1 ? "online" : "in-person", // One online
                    status: "Scheduled",
                    duration: 50,
                    meetingLink: index === 1 ? "https://zoom.us/j/today-mock" : null,
                }
            });
        }
    }

    console.log('✅ Seeding finished.');
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
