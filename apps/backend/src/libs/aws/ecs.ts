import {
  DeregisterTaskDefinitionCommand,
  ECSClient,
  ListTaskDefinitionsCommand,
  RegisterTaskDefinitionCommand,
  RegisterTaskDefinitionCommandInput,
} from "@aws-sdk/client-ecs";
import { CONSTANT } from "../../../constant";
import { getDefaultCredentials } from "./credentials";

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
