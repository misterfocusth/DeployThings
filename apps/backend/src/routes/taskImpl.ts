import { type AppRouteImplementation } from "@ts-rest/express";

// Contracts
import { contract } from "@repo/contracts";
import prisma from "../libs/db";
import { getTaskDefinitionJSON } from "../libs/taskDefinition";
import { ApplicationProtocol, TransportProtocol } from "@aws-sdk/client-ecs";
import { createECSTaskDefinition, deleteECSTaskDefinition } from "../libs/aws/ecs";
import { ContainerPortProtocol, ExposePortProtocol, OperatingSystem } from "@prisma/client";

export const listTasks: AppRouteImplementation<typeof contract.task.listTasks> = async () => {
  try {
    const tasks = await prisma.taskDefinition.findMany({
      include: {
        computingOption: true,
        storageOption: true,
        taskEnvironmentVariable: {
          select: {
            id: true,
            key: true,
            value: true,
          },
        },
        userImage: {
          include: {
            repository: true,
            user: true,
          },
        },
      },
    });

    if (!tasks) {
      return {
        status: 404,
        body: {
          error: "No tasks found",
        },
      };
    }

    return {
      status: 200,
      body: tasks,
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

export const createTask: AppRouteImplementation<typeof contract.task.createTask> = async ({
  body,
}) => {
  try {
    const {
      containerName,
      taskName,
      userId,
      os,
      computingOptionId,
      storageOptionId,
      userImageId,
      portMapping,
      environmentVariables,
    } = body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const computingOption = await prisma.computingOption.findUnique({
      where: {
        id: computingOptionId,
      },
    });

    const storageOption = await prisma.storageOption.findUnique({
      where: {
        id: storageOptionId,
      },
    });

    const userImage = await prisma.userImage.findUnique({
      where: {
        id: userImageId,
      },
      include: {
        repository: true,
      },
    });

    let notFoundResult = "";

    if (!user) notFoundResult = "User not found";
    else if (!computingOption) notFoundResult = "Computing option not found";
    else if (!storageOption) notFoundResult = "Storage option not found";
    else if (!userImage) notFoundResult = "User image not found";

    if (!user || !computingOption || !storageOption || !userImage) {
      return {
        status: 404,
        body: {
          error: notFoundResult,
        },
      };
    }

    const taskDefinitionParams = getTaskDefinitionJSON({
      os,
      name: taskName,
      userImage,
      repository: userImage.repository,
      storageOption,
      computingOption,
      containerPort: portMapping.containerPort,
      containerPortProtocol: portMapping.containerPortProtocol as ApplicationProtocol,
      exposedPort: portMapping.exposedPort,
      exposedPortProtocol: portMapping.exposedPortProtocol as TransportProtocol,
      environmentVariables,
    });

    const taskDefinition = await createECSTaskDefinition(taskDefinitionParams);

    if (!taskDefinition || !taskDefinition.taskDefinition) {
      return {
        status: 500,
        body: {
          error: "Error creating task definition",
        },
      };
    }

    const containerPortProtocol: ContainerPortProtocol =
      portMapping.containerPortProtocol.toUpperCase() === "TCP" ? "TCP" : "UDP";
    let exposedPortProtocol: ExposePortProtocol = "HTTP";

    if (portMapping.exposedPortProtocol.toUpperCase() === "GRPC") {
      exposedPortProtocol = "GRPC";
    } else if (portMapping.exposedPortProtocol.toUpperCase() === "HTTP") {
      exposedPortProtocol = "HTTP";
    } else if (portMapping.exposedPortProtocol.toUpperCase() === "HTTP2") {
      exposedPortProtocol = "HTTP2";
    } else if (portMapping.exposedPortProtocol.toUpperCase() === "NONE") {
      exposedPortProtocol = "NONE";
    }

    const existingTask = await prisma.taskDefinition.findFirst({
      where: {
        name: taskName,
      },
    });

    const task = await prisma.taskDefinition.upsert({
      where: {
        id: existingTask?.id || "",
      },
      update: {
        name: taskName,
        arn: taskDefinition.taskDefinition.taskDefinitionArn!,
        revision: taskDefinition.taskDefinition.revision!,
        taskRoleArn: taskDefinition.taskDefinition.taskRoleArn || undefined,
        executionRoleArn: taskDefinition.taskDefinition.executionRoleArn || undefined,
        launchType: taskDefinition.taskDefinition.requiresCompatibilities![0],
        operatingSystem: os as OperatingSystem,
        containerName: containerName,
        containerPort: portMapping.containerPort,
        containerPortProtocol,
        exposedPort: portMapping.exposedPort,
        exposedPortProtocol,
        userImage: {
          connect: {
            id: userImage.id,
          },
        },
        computingOption: {
          connect: {
            id: computingOption.id,
          },
        },
        storageOption: {
          connect: {
            id: storageOption.id,
          },
        },
        taskEnvironmentVariable: {
          create: environmentVariables?.map((env) => {
            return {
              key: env.key,
              value: env.value,
            };
          }),
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      create: {
        name: taskName,
        arn: taskDefinition.taskDefinition.taskDefinitionArn!,
        revision: taskDefinition.taskDefinition.revision!,
        taskRoleArn: taskDefinition.taskDefinition.taskRoleArn || undefined,
        executionRoleArn: taskDefinition.taskDefinition.executionRoleArn || undefined,
        launchType: taskDefinition.taskDefinition.requiresCompatibilities![0],
        operatingSystem: os as OperatingSystem,
        containerName: containerName,
        containerPort: portMapping.containerPort,
        containerPortProtocol,
        exposedPort: portMapping.exposedPort,
        exposedPortProtocol,
        userImage: {
          connect: {
            id: userImage.id,
          },
        },
        computingOption: {
          connect: {
            id: computingOption.id,
          },
        },
        storageOption: {
          connect: {
            id: storageOption.id,
          },
        },
        taskEnvironmentVariable: {
          create: environmentVariables?.map((env) => {
            return {
              key: env.key,
              value: env.value,
            };
          }),
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        computingOption: true,
        storageOption: true,
        taskEnvironmentVariable: {
          select: {
            id: true,
            key: true,
            value: true,
          },
        },
        userImage: {
          include: {
            repository: true,
            user: true,
          },
        },
      },
    });

    return {
      status: 201,
      body: task,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      body: {
        error: error as string,
      },
    };
  }
};

export const deleteTask: AppRouteImplementation<typeof contract.task.deleteTask> = async ({
  params,
}) => {
  try {
    const { id } = params;

    const task = await prisma.taskDefinition.findUnique({
      where: {
        id: id,
      },
    });

    if (!task) {
      return {
        status: 404,
        body: {
          error: "Task not found",
        },
      };
    }

    await deleteECSTaskDefinition(task.arn);

    await prisma.taskDefinition.delete({
      where: {
        id: id,
      },
    });

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
