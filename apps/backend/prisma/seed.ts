import prisma from "../src/libs/db";
import { randomUUID } from "crypto";

const initialRepository = [
  {
    name: "deploythings/sila_pakdeewong/nginx",
    uri: "398224632975.dkr.ecr.ap-southeast-1.amazonaws.com/deploythings/sila_pakdeewong/nginx",
    createdAt: "2024-11-04T16:38:36.401Z",
    updatedAt: "2024-11-04T16:38:36.401Z",
  },
  {
    name: "deploythings/sila_pakdeewong/mysql",
    uri: "398224632975.dkr.ecr.ap-southeast-1.amazonaws.com/deploythings/sila_pakdeewong/mysql",
    createdAt: "2024-11-04T16:40:44.790Z",
    updatedAt: "2024-11-04T16:40:44.790Z",
  },
  {
    name: "deploythings/sila_pakdeewong/postgres",
    uri: "398224632975.dkr.ecr.ap-southeast-1.amazonaws.com/deploythings/sila_pakdeewong/postgres",
    createdAt: "2024-11-04T16:43:03.078Z",
    updatedAt: "2024-11-04T16:43:03.078Z",
  },
  {
    name: "deploythings/sila_pakdeewong/redis",
    uri: "398224632975.dkr.ecr.ap-southeast-1.amazonaws.com/deploythings/sila_pakdeewong/redis",
    createdAt: "2024-11-04T16:46:18.439Z",
    updatedAt: "2024-11-04T16:46:18.439Z",
  },
  {
    name: "deploythings/sila_pakdeewong/mongo",
    uri: "398224632975.dkr.ecr.ap-southeast-1.amazonaws.com/deploythings/sila_pakdeewong/mongo",
    createdAt: "2024-11-04T16:47:40.166Z",
    updatedAt: "2024-11-04T16:47:40.166Z",
  },
];

const initialUserImages = [
  {
    imageName: "nginx",
    imageTag: "latest",
    pushedAt: "2024-11-04T16:38:52.147Z",
    size: 72937963,
    digest: "sha256:7ba542bde95e6523a4b126f610553e3657b8108bc3175596ee7e911ae1219bfc",
    createdAt: "2024-11-04T16:38:53.143Z",
    updatedAt: "2024-11-04T16:38:53.143Z",
  },
  {
    imageName: "mysql",
    imageTag: "latest",
    pushedAt: "2024-11-04T16:41:44.775Z",
    size: 168712472,
    digest: "sha256:4294aa57f0d6249f4d511d980b814adf50b9fc52d23333c18e5f4a874d830ab0",
    createdAt: "2024-11-04T16:41:46.523Z",
    updatedAt: "2024-11-04T16:41:46.523Z",
  },
  {
    imageName: "postgres",
    imageTag: "latest",
    pushedAt: "2024-11-04T16:45:49.821Z",
    size: 154587024,
    digest: "sha256:1d3327ead0f0474d87385e782cfca8af284281b920a4719bc24b9a3691ee05ac",
    createdAt: "2024-11-04T16:43:48.863Z",
    updatedAt: "2024-11-04T16:45:50.799Z",
  },
  {
    imageName: "redis",
    imageTag: "latest",
    pushedAt: "2024-11-04T16:46:40.545Z",
    size: 45901386,
    digest: "sha256:6df8098f056f25e26890a11bbe06fa59a6fd035691d1b2747ff192e1a04b4e0b",
    createdAt: "2024-11-04T16:46:41.563Z",
    updatedAt: "2024-11-04T16:46:41.563Z",
  },
  {
    imageName: "mongo",
    imageTag: "latest",
    pushedAt: "2024-11-04T16:49:18.708Z",
    size: 275464925,
    digest: "sha256:3cd6856b5de74aba9a0209e5e9002808014e241bbf996edb6cc2c4691f805fe2",
    createdAt: "2024-11-04T16:49:21.157Z",
    updatedAt: "2024-11-04T16:49:21.157Z",
  },
];

const initialComputeOptions = [
  {
    id: "1",
    name: "General Purpose",
    availableCPU: 1,
    availableMemory: 2,
    costPerHour: 3,
  },
  {
    id: "2",
    name: "Memory Optimized",
    availableCPU: 2,
    availableMemory: 8,
    costPerHour: 6,
  },
  {
    id: "3",
    name: "CPU Optimized",
    availableCPU: 4,
    availableMemory: 8,
    costPerHour: 5,
  },
  {
    id: "4",
    name: "Compute Accelerated",
    availableCPU: 8,
    availableMemory: 16,
    costPerHour: 4,
  },
];

const initialStorageOptions = [
  {
    id: "1",
    name: "SSD v1",
    storageSize: 64,
    costPerHour: 1,
  },
  {
    id: "2",
    name: "SSD v2",
    storageSize: 128,
    costPerHour: 2,
  },
  {
    id: "3",
    name: "SSD v3",
    storageSize: 256,
    costPerHour: 4,
  },
  {
    id: "4",
    name: "SSD v4",
    storageSize: 512,
    costPerHour: 8,
  },
];

const main = async () => {
  await prisma.user.upsert({
    where: {
      id: "1",
    },
    update: {},
    create: {
      id: "1",
      email: "65070219@kmitl.ac.th",
      name: "Sila Pakdeewong",
      //   dockerHubAccessToken: process.env.DOCKER_HUB_ACCESS_TOKEN,
    },
  });

  await prisma.project.upsert({
    where: {
      id: "1",
    },
    update: {},
    create: {
      id: "1",
      name: "Main Project",
      description: "Main project for testing",
      owner: {
        connect: {
          id: "1",
        },
      },
    },
  });

  for (const computeOption of initialComputeOptions) {
    await prisma.computingOption.upsert({
      where: {
        id: computeOption.id,
      },
      update: {},
      create: computeOption,
    });
  }

  for (const storageOption of initialStorageOptions) {
    await prisma.storageOption.upsert({
      where: {
        id: storageOption.id,
      },
      update: {},
      create: storageOption,
    });
  }

  for (let x = 0; x < initialRepository.length; x++) {
    const repositoryId = randomUUID().split("-")[0];
    const repositoryData = initialRepository[x];

    await prisma.repository.upsert({
      where: {
        id: repositoryId,
      },
      update: {},
      create: {
        id: repositoryId,
        ...repositoryData,
        owner: {
          connect: {
            id: "1",
          },
        },
      },
    });

    const userImageId = randomUUID().split("-")[0];
    const userImageData = initialUserImages[x];

    await prisma.userImage.upsert({
      where: {
        id: userImageId,
      },
      update: {},
      create: {
        id: userImageId,
        ...userImageData,
        user: {
          connect: {
            id: "1",
          },
        },
        repository: {
          connect: {
            id: repositoryId,
          },
        },
      },
    });
  }
};

main()
  .then(async () => {
    console.log("Seed data created successfully");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });