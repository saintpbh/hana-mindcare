
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📍 Adding specialized locations...');

    const specializedLocations = ['Zoom (화상)', 'Phone (전화)'];

    for (const loc of specializedLocations) {
        const exists = await prisma.location.findUnique({ where: { name: loc } });
        if (!exists) {
            await prisma.location.create({ data: { name: loc } });
            console.log(`Created: ${loc}`);
        } else {
            console.log(`Skipped (Exists): ${loc}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
