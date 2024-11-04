import {
  CreateClusterCommand,
  CreateServiceCommand,
  DeleteServiceCommand,
  DeregisterTaskDefinitionCommand,
  DescribeTasksCommand,
  ECSClient,
  ListTaskDefinitionsCommand,
  ListTasksCommand,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandInput,
  UpdateServiceCommand,
  waitUntilServicesInactive,
} from "@aws-sdk/client-ecs";
import { CONSTANT } from "../../../constant";
import { getDefaultCredentials } from "./credentials";
import { Cluster, Service, TaskDefinition } from "@prisma/client";
import { EC2Client, DescribeNetworkInterfacesCommand } from "@aws-sdk/client-ec2";

const credentials = getDefaultCredentials();

const ecsClient = new ECSClient({ region: CONSTANT.AWS_REGION, credentials: credentials });
const ec2Client = new EC2Client({ region: CONSTANT.AWS_REGION, credentials: credentials });

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

export const getPublicIPandPort = async ({
  cluster,
  serviceArn,
}: {
  cluster: Cluster;
  serviceArn: string;
}) => {
  const clusterArn = cluster.arn;

  try {
    const listTasksResponse = await ecsClient.send(
      new ListTasksCommand({
        cluster: clusterArn,
        serviceName: serviceArn,
      })
    );

    const taskArns = listTasksResponse.taskArns;
    if (!taskArns || taskArns.length === 0) {
      console.error("No tasks found");
      return;
    }

    const describeTasksResponse = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: clusterArn,
        tasks: taskArns,
      })
    );

    let publicIP = null;
    let publicPort = null;

    for (const task of describeTasksResponse.tasks || []) {
      const eniIds = task.attachments
        ?.flatMap((attachment) =>
          attachment.details?.find((detail) => detail.name === "networkInterfaceId")
        )
        .map((detail) => detail?.value)
        .filter(Boolean);

      if (!eniIds || eniIds.length === 0) {
        console.error("No network interface found");
        return;
      }

      const eniDetails = await ec2Client.send(
        new DescribeNetworkInterfacesCommand({
          NetworkInterfaceIds: eniIds as string[],
        })
      );

      for (const eni of eniDetails.NetworkInterfaces || []) {
        const _publicIp = eni.Association?.PublicIp;
        if (_publicIp) {
          publicIP = _publicIp;
        } else {
          console.log(`No public IP associated with ENI ${eni.NetworkInterfaceId}`);
        }
      }

      const container = task.containers?.[0];
      if (container && container?.networkBindings) {
        for (const binding of container.networkBindings) {
          const _publicPort = binding.hostPort;
          if (_publicPort) {
            publicPort = _publicPort;
          } else {
            console.log(`No public port found for container ${container.name}`);
          }
        }
      }
    }

    if (!publicIP || !publicPort) {
      console.error("No public IP or port found");
      return;
    }

    return { publicIP, publicPort };
  } catch (error) {
    console.error("Error getting public IP and port", error);
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
