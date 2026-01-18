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

    // Clear existing data (optional, but good for idempotent seed)
    // await prisma.client.deleteMany()

    for (const client of MOCK_CLIENTS) {
        const { id, ...data } = client // We let Prisma generate UUIDs or use the one provided if we want consistency? 
        // MOCK_CLIENTS has simple IDs like "1", "2". Prisma uses UUIDs by default in my schema.
        // To keep it simple for migration, let's just create them. 
        // Or we can change the schema to not Force UUID if we want to keep "1", "2".
        // But real DBs should use UUIDs. I'll let Prisma generate new UUIDs and we will move away from "1", "2".
        // However, if the app relies on "1", "2" for routing, I should be careful.
        // The current app uses `clients.find(c => c.id === id)`.
        // It's better to migrate to UUIDs now.

        await prisma.client.create({
            data: {
                ...data,
                // Ensure optional fields are handled if undefined in mock
                englishName: data.englishName || null,
                location: data.location || null,
                isSessionCanceled: data.isSessionCanceled || false,
            }
        })
    }

    console.log(`Seeded ${MOCK_CLIENTS.length} clients.`)
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
