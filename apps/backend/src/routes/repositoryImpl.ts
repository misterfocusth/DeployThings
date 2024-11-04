import { type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { contract } from "@repo/contracts";
import { createECRRepository, deleteECRRepository } from "../libs/aws/ecr";
import prisma from "../libs/db";

export const listRepositories: AppRouteImplementation<
  typeof contract.repository.listRepositories
> = async () => {
  const repositories = await prisma.repository.findMany({
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!repositories) {
    return {
      status: 500,
      body: {
        error: "Internal server error",
      },
    };
  }

  return {
    status: 200,
    body: repositories,
  };
};

export const createRepository: AppRouteImplementation<
  typeof contract.repository.createRepository
> = async ({ body }) => {
  const ercRepository = await createECRRepository(body.name, "");

  if (!ercRepository.repository || !ercRepository.repository.repositoryUri) {
    return {
      status: 500,
      body: {
        error: "Internal server error",
      },
    };
  }

  const repository = await prisma.repository.create({
    data: {
      name: body.name,
      uri: ercRepository.repository.repositoryUri,
      ownerId: "1",
    },
    include: {
      owner: true,
    },
  });

  return {
    status: 201,
    body: repository,
  };
};

export const deleteRepository: AppRouteImplementation<
  typeof contract.repository.deleteRepository
> = async ({ params }) => {
  const repository = await prisma.repository.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!repository) {
    return {
      status: 404,
      body: {
        error: "Repository not found",
      },
    };
  }

  try {
    await deleteECRRepository({ repositoryName: repository.name });

    const deleteUserImage = prisma.userImage.deleteMany({
      where: {
        repositoryId: params.id,
      },
    });

    const deleteRepository = prisma.repository.delete({
      where: {
        id: params.id,
      },
    });

    await prisma.$transaction([deleteUserImage, deleteRepository]);

    return {
      status: 204,
      body: null,
    };
  } catch (error) {
    console.error("Error deleting repository:", error);
    return {
      status: 500,
      body: {
        error: "Internal server error",
      },
    };
  }
};
