import { type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { contract } from "@repo/contracts";
import prisma from "../libs/db";
import {
  createECSCluster,
  createECSService,
  deleteEcsService,
  deleteECSTaskDefinition,
  getPublicIPAddress,
} from "../libs/aws/ecs";

export const listServices: AppRouteImplementation<
  typeof contract.service.listServices
> = async () => {
  try {
    const services = await prisma.service.findMany({
      include: {
        cluster: {
          include: {
            owner: true,
          },
        },
        taskDefinition: {
          include: {
            userImage: {
              include: {
                repository: true,
              },
            },
            computingOption: true,
            storageOption: true,
            taskEnvironmentVariable: {
              select: {
                id: true,
                key: true,
                value: true,
              },
            },
          },
        },
      },
    });

    if (!services) {
      return {
        status: 404,
        body: {
          error: "Services not found",
        },
      };
    }

    return {
      status: 200,
      body: services,
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error as string,
      },
    };
  }
};

export const createService: AppRouteImplementation<typeof contract.service.createService> = async ({
  body,
}) => {
  const { serviceName, userId, taskDefinitionId, providerBase, providerWeight } = body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const taskDefinition = await prisma.taskDefinition.findUnique({
      where: {
        id: taskDefinitionId,
      },
    });

    let notFoundError = "";

    if (!user) notFoundError = "User not found";
    if (!taskDefinition) notFoundError = "Task definition not found";

    if (!user || !taskDefinition) {
      return {
        status: 404,
        body: {
          error: notFoundError,
        },
      };
    }

    let userCluster = await prisma.cluster.findUnique({
      where: {
        ownerId: user.id,
      },
    });

    if (!userCluster) {
      const clusterName = `${user.name.split(" ").join("_")}_cluster`;
      const { cluster } = await createECSCluster({ clusterName });

      if (!cluster) {
        return {
          status: 500,
          body: {
            error: "Error creating cluster",
          },
        };
      }

      userCluster = await prisma.cluster.create({
        data: {
          arn: cluster.clusterArn!,
          name: cluster.clusterName!,
          namespace: cluster.clusterName!,
          infrastructure: "FARGATE",
          owner: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }

    const existingService = await prisma.service.findFirst({
      where: {
        name: serviceName,
        clusterId: userCluster.id,
      },
    });

    if (existingService) {
      return {
        status: 400,
        body: {
          error: "Service already exists",
        },
      };
    }

    const { service } = await createECSService({
      serviceName,
      cluster: userCluster,
      taskDefinition: taskDefinition,
      providerBase,
      providerWeight,
    });

    if (!service) {
      return {
        status: 500,
        body: {
          error: "Error creating service",
        },
      };
    }

    const clusterArn = userCluster.arn;
    const serviceArn = service.serviceArn!;

    const publicIP = await getPublicIPAddress({
      clusterArn,
      serviceArn,
    });

    const createdService = await prisma.service.create({
      data: {
        arn: service.serviceArn!,
        name: service.serviceName!,
        publicIP: publicIP || "",
        publicPort: taskDefinition.exposedPort,
        providerBase,
        providerWeight,
        taskDefinition: {
          connect: {
            id: taskDefinition.id,
          },
        },
        cluster: {
          connect: {
            id: userCluster.id,
          },
        },
      },
      include: {
        cluster: {
          include: {
            owner: true,
          },
        },
        taskDefinition: {
          include: {
            userImage: {
              include: {
                repository: true,
              },
            },
            computingOption: true,
            storageOption: true,
            taskEnvironmentVariable: {
              select: {
                id: true,
                key: true,
                value: true,
              },
            },
          },
        },
      },
    });

    return {
      status: 201,
      body: createdService,
    };
  } catch (error) {
    console.log("Error creating service", error);
    return {
      status: 500,
      body: {
        error: error as string,
      },
    };
  }
};

export const deleteService: AppRouteImplementation<typeof contract.service.deleteService> = async ({
  params,
}) => {
  const { id } = params;

  try {
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        cluster: true,
      },
    });

    const taskDefinition = await prisma.taskDefinition.findUnique({
      where: {
        id: service?.taskDefinitionId,
      },
    });

    if (!service || !taskDefinition) {
      return {
        status: 404,
        body: {
          error: "Service or Task Definition not found",
        },
      };
    }

    await deleteEcsService({
      cluster: service.cluster,
      service: service,
    });

    await deleteECSTaskDefinition(taskDefinition.name);

    const deleteService = prisma.service.delete({
      where: {
        id: service.id,
      },
    });

    const deleteTaskEnvironmentVariables = prisma.taskEnvironmentVariable.deleteMany({
      where: {
        taskDefinitionId: taskDefinition.id,
      },
    });

    const deleteTaskDefinition = prisma.taskDefinition.delete({
      where: {
        id: taskDefinition.id,
      },
    });

    await prisma.$transaction([
      deleteService,
      deleteTaskEnvironmentVariables,
      deleteTaskDefinition,
    ]);

    return {
      status: 204,
      body: null,
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error as string,
      },
    };
  }
};
