import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const locations = await prisma.location.findMany()
    console.log('--- Locations ---')
    console.log(JSON.stringify(locations, null, 2))

    const clients = await prisma.client.findMany({
        take: 1,
        select: { id: true, name: true, sessionType: true }
    })
    console.log('--- Client Sample ---')
    console.log(JSON.stringify(clients, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
