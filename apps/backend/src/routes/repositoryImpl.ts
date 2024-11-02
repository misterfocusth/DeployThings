import {type AppRouteImplementation} from "@ts-rest/express";

// Contracts
import {contract} from "@repo/contracts";
import {createECRRepository, listECRRepositories} from "../libs/aws/ecr";
import prisma from "../libs/db";

export const listRepositories: AppRouteImplementation<typeof contract.repository.listRepositories> = async () => {
    const ecrRepositories = await listECRRepositories();
    console.log(ecrRepositories);

    const repositories = await prisma.repository.findMany({
        include: {
            owner: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if (!repositories) {
        return {
            status: 500,
            body: {
                error: "Internal server error"
            }
        }
    }

    return {
        status: 200,
        body: repositories
    }
};

export const createRepository: AppRouteImplementation<typeof contract.repository.createRepository> = async ({body}) => {
    const ercRepository = await createECRRepository(body.name, '');

    if (!ercRepository.repository || !ercRepository.repository.repositoryUri) {
        return {
            status: 500,
            body: {
                error: "Internal server error"
            }
        }
    }

    const repository = await prisma.repository.create({
        data: {
            name: body.name,
            uri: ercRepository.repository.repositoryUri,
            ownerId: "1"
        },
        include: {
            owner: true
        }
    });

    return {
        status: 201,
        body: repository
    }
};