import {
  CreateClusterCommand,
  CreateServiceCommand,
  DeleteServiceCommand,
  DeregisterTaskDefinitionCommand,
  ECSClient,
  ListTaskDefinitionsCommand,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandInput,
  UpdateServiceCommand,
  waitUntilServicesInactive,
} from "@aws-sdk/client-ecs";
import { CONSTANT } from "../../../constant";
import { getDefaultCredentials } from "./credentials";
import { Cluster, Service, TaskDefinition } from "@prisma/client";

const credentials = getDefaultCredentials();
const ecsClient = new ECSClient({ region: CONSTANT.AWS_REGION, credentials: credentials });

export const createECSTaskDefinition = async (
  taskDefinitionParams: RegisterTaskDefinitionCommandInput
) => {
  const command = new RegisterTaskDefinitionCommand(taskDefinitionParams);

  try {
    return await ecsClient.send(command);
  } catch (error) {
    console.error("Error creating ECS Task Definition", error);
    throw error;
  }
};

export const deleteECSTaskDefinition = async (taskDefinitionFamilyName: string) => {
  try {
    const listAllTasksCommand = new ListTaskDefinitionsCommand({
      familyPrefix: taskDefinitionFamilyName,
      sort: "DESC",
    });

    const taskDefinitions = await ecsClient.send(listAllTasksCommand);
    const taskDefinitionArns = taskDefinitions.taskDefinitionArns;

    if (!taskDefinitionArns || taskDefinitionArns.length === 0) {
      console.error("No task definition found");
      return;
    }

    for (const taskDefinitionArn of taskDefinitionArns) {
      const deregisterCommand = new DeregisterTaskDefinitionCommand({
        taskDefinition: taskDefinitionArn,
      });
      await ecsClient.send(deregisterCommand);
    }
  } catch (error) {
    console.error("Error deleting ECS Task Definition", error);
    throw error;
  }
};

export const createECSCluster = async ({ clusterName }: { clusterName: string }) => {
  const command = new CreateClusterCommand({
    clusterName,
    capacityProviders: ["FARGATE_SPOT", "FARGATE"],
  });

  try {
    return await ecsClient.send(command);
  } catch (error) {
    console.error("Error creating ECS Cluster", error);
    throw error;
  }
};

export const createECSService = async ({
  serviceName,
  cluster,
  taskDefinition,
  providerBase,
  providerWeight,
}: {
  serviceName: string;
  cluster: Cluster;
  taskDefinition: TaskDefinition;
  providerBase: number;
  providerWeight: number;
}) => {
  if (!CONSTANT.AWS_SUBNETS[0] || !CONSTANT.AWS_SUBNETS[1] || !CONSTANT.AWS_SUBNETS[2]) {
    throw new Error("AWS_SUBNETS are not set");
  }

  if (!CONSTANT.AWS_SECURITY_GROUP_ID) {
    throw new Error("AWS_SECURITY_GROUP_ID is not set");
  }

  const command = new CreateServiceCommand({
    cluster: cluster.arn,
    serviceName: serviceName,
    taskDefinition: taskDefinition.arn,
    desiredCount: 1,
    capacityProviderStrategy: [
      // {
      //   capacityProvider: "FARGATE_SPOT",
      //   base: providerBase,
      //   weight: providerWeight,
      // },
      {
        capacityProvider: "FARGATE",
        base: providerBase,
        weight: providerWeight,
      },
    ],
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [CONSTANT.AWS_SUBNETS[0], CONSTANT.AWS_SUBNETS[1], CONSTANT.AWS_SUBNETS[2]],
        securityGroups: [CONSTANT.AWS_SECURITY_GROUP_ID],
        assignPublicIp: "ENABLED",
      },
    },
    launchType: "FARGATE",
  });

  try {
    return await ecsClient.send(command);
  } catch (error) {
    console.error("Error creating ECS Service", error);
    throw error;
  }
};

export const deleteEcsService = async ({
  cluster,
  service,
}: {
  cluster: Cluster;
  service: Service;
}) => {
  const clusterArn = cluster.arn;
  const serviceArn = service.arn;

  try {
    await ecsClient.send(
      new UpdateServiceCommand({
        cluster: clusterArn,
        service: serviceArn,
        desiredCount: 0,
      })
    );

    await waitUntilServicesInactive(
      { client: ecsClient, maxWaitTime: 1000 },
      { cluster: clusterArn, services: [serviceArn] }
    );

    await ecsClient.send(
      new DeleteServiceCommand({
        cluster: clusterArn,
        service: serviceArn,
        force: true,
      })
    );
  } catch (error) {
    console.error("Error deleting ECS service:", error);
    throw error;
  }
};
