import prisma from "../src/libs/db";

const initialComputeOptions = [
    {
        id: "1",
        name: 'General Purpose',
        availableCPU: 1,
        availableMemory: 2,
        costPerHour: 3
    },
    {
        id: "2",
        name: 'Memory Optimized',
        availableCPU: 2,
        availableMemory: 8,
        costPerHour: 6
    },
    {
        id: "3",
        name: 'CPU Optimized',
        availableCPU: 4,
        availableMemory: 8,
        costPerHour: 5
    },
    {
        id: "4",
        name: 'Compute Accelerated',
        availableCPU: 8,
        availableMemory: 16,
        costPerHour: 4
    }
]

const initialStorageOptions = [
    {
        id: "1",
        name: 'SSD v1',
        storageSize: 64,
        costPerHour: 1
    },
    {
        id: "2",
        name: 'SSD v2',
        storageSize: 128,
        costPerHour: 2
    },
    {
        id: "3",
        name: 'SSD v3',
        storageSize: 256,
        costPerHour: 4
    },
    {
        id: "4",
        name: 'SSD v4',
        storageSize: 512,
        costPerHour: 8
    },
]

const main = async () => {
    await prisma.user.upsert({
        where: {
            id: '1'
        },
        update: {},
        create: {
            id: '1',
            email: '65070219@kmitl.ac.th',
            name: 'Sila Pakdeewong',
            dockerHubAccessToken: process.env.DOCKER_HUB_ACCESS_TOKEN,
        }
    })

    await prisma.project.upsert({
        where: {
            id: '1'
        },
        update: {},
        create: {
            id: '1',
            name: 'Main Project',
            description: 'Main project for testing',
            owner: {
                connect: {
                    id: '1'
                }
            }
        }
    })

    for (const computeOption of initialComputeOptions) {
        await prisma.computingOption.upsert({
            where: {
                id: computeOption.id
            },
            update: {},
            create: computeOption
        })
    }

    for (const storageOption of initialStorageOptions) {
        await prisma.storageOption.upsert({
            where: {
                id: storageOption.id
            },
            update: {},
            create: storageOption
        })
    }
}

main().then(async () => {
    console.log('Seed data created successfully')
    await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
})