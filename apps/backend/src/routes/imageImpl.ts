import {type AppRouteImplementation} from "@ts-rest/express";

// Contracts
import {contract} from "@repo/contracts";
import prisma from "../libs/db";
import {createECRRepository, uploadImageToECR} from "../libs/aws/ecr";

export const listImages: AppRouteImplementation<typeof contract.image.listImages> = async () => {
    const images = await prisma.userImage.findMany({
        include: {
            user: true,
            repository: true
        }
    })

    if (!images) {
        return {
            status: 404,
            body: {error: "Images not found"}
        }
    }

    return {
        status: 200,
        body: images
    }
};

export const listUserImages: AppRouteImplementation<typeof contract.image.listUserImages> = async ({params}) => {
    const {userId} = params;

    const images = await prisma.userImage.findMany({
        where: {
            userId: userId
        },
        include: {
            user: true,
            repository: true
        }
    })

    if (!images) {
        return {
            status: 404,
            body: {error: "Images not found"}
        }
    }


    return {
        status: 200,
        body: images
    }
};


export const pullAndUploadImage: AppRouteImplementation<typeof contract.image.pullAndUploadImage> = async ({body}) => {
    const {imageName, userId} = body;

    if (!imageName || !userId) {
        return {
            status: 400,
            body: {
                error: "Missing required fields"
            }
        }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            repository: true,
        }
    })

    if (!user) {
        return {
            status: 404,
            body: {
                error: "User not found"
            }
        }
    } else if (!user.dockerHubAccessToken) {
        return {
            status: 404,
            body: {
                error: "User's docker hub access token not found"
            }
        }
    }

    let imageRepository = await prisma.repository.findFirst({
        where: {
            userImage: {
                imageName: imageName
            }
        }
    })

    if (!imageRepository) {
        const ercRepository = await createECRRepository(user.name, imageName);

        if (!ercRepository.repository ||
            !ercRepository.repository.repositoryUri ||
            !ercRepository.repository.repositoryName
        ) {
            return {
                status: 500,
                body: {
                    error: "Internal server error"
                }
            }
        }

        imageRepository = await prisma.repository.create({
            data: {
                name: ercRepository.repository.repositoryName,
                uri: ercRepository.repository.repositoryUri,
                ownerId: userId
            }
        })
    }

    const dockerHubAccessToken = user.dockerHubAccessToken;
    const repositoryUri = imageRepository.uri;
    const repositoryId = imageRepository.id;

    const imageDetails = await uploadImageToECR(imageName, dockerHubAccessToken, repositoryUri);

    if (!imageDetails) {
        return {
            status: 404,
            body: {
                error: `Image ${imageName} not found in repository ${repositoryUri}`
            }
        }
    }

    const image = await prisma.userImage.create({
        data: {
            imageName: "",
            imageTag: imageDetails.imageTags!.join(','),
            pushedAt: imageDetails.imagePushedAt!,
            size: imageDetails.imageSizeInBytes!,
            digest: imageDetails.imageDigest!,
            userId: userId,
            repositoryId: repositoryId
        },
        include: {
            user: true,
            repository: true
        }
    })

    return {
        status: 201,
        body: image
    }
};