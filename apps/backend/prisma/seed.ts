import prisma from "../src/libs/db";

const initialComputeOptions = [
    {
        id: "1",
        name: 'General Purpose',
        availableCPU: 2,
        availableMemory: 4,
        costPerHour: 3
    },
    {
        id: "2",
        name: 'Memory Optimized',
        availableCPU: 1,
        availableMemory: 8,
        costPerHour: 6
    },
    {
        id: "3",
        name: 'CPU Optimized',
        availableCPU: 4,
        availableMemory: 2,
        costPerHour: 5
    },
    {
        id: "4",
        name: 'GPU Optimized',
        availableCPU: 2,
        availableMemory: 4,
        costPerHour: 10
    },
    {
        id: "5",
        name: 'Storage Optimized',
        availableCPU: 2,
        availableMemory: 4,
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
        name: 'HDD v1',
        storageSize: 32,
        costPerHour: 0.5
    },
    {
        id: "5",
        name: 'HDD v2',
        storageSize: 64,
        costPerHour: 1
    },
    {
        id: "6",
        name: 'HDD v3',
        storageSize: 128,
        costPerHour: 2
    },
    {
        id: "7",
        name: 'HDD v4',
        storageSize: 256,
        costPerHour: 4
    }
]

const main = async () => {
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