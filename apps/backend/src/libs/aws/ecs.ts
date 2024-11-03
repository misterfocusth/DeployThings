import {
  ECSClient,
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