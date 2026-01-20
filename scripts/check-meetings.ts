import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const sessions = await prisma.session.findMany({
        where: {
            location: { contains: 'Zoom' }
        },
        select: {
            id: true,
            title: true,
            location: true,
            meetingLink: true
        },
        take: 10
    })

    console.log('--- Zoom Sessions ---')
    console.log(JSON.stringify(sessions, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
