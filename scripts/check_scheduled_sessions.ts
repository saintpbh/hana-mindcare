import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
    const sessions = await prisma.session.findMany({
        where: {
            status: 'Scheduled',
        },
        orderBy: {
            date: 'asc',
        },
        include: {
            client: true
        }
    });

    console.log("Current System Time:", new Date().toString());
    console.log("Scheduled Sessions in DB:");
    sessions.forEach(s => {
        console.log(`- [${s.date.toISOString()}] ${s.client.name} (ID: ${s.id})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
