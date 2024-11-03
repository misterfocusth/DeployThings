import { ComputingOption, Repository, StorageOption, UserImage } from "@prisma/client";
import {
  ApplicationProtocol,
  CPUArchitecture,
  OSFamily,
  RegisterTaskDefinitionCommandInput,
  RuntimePlatform,
  TransportProtocol,
} from "@aws-sdk/client-ecs";

export const getTaskDefinitionJSON = ({
  os,
  name,
  userImage,
  repository,
  storageOption,
  computingOption,
  containerPort,
  containerPortProtocol,
  exposedPort,
  exposedPortProtocol,
  environmentVariables,
}: {
  os: string;
  name: string;
  userImage: UserImage;
  repository: Repository;
  storageOption: StorageOption;
  computingOption: ComputingOption;
  containerPort: number;
  containerPortProtocol: ApplicationProtocol;
  exposedPort: number;
  exposedPortProtocol: TransportProtocol;
  environmentVariables?: { [key: string]: string }[];
}) => {
  const taskDefinitionParams: RegisterTaskDefinitionCommandInput = {
    family: name,
    taskRoleArn: process.env.TASK_ROLE_ARN || undefined,
    executionRoleArn: process.env.EXECUTION_ROLE_ARN || undefined,
    networkMode: "awsvpc",
    runtimePlatform: getOpratingSystemConfig(os),
    containerDefinitions: [
      {
        name: userImage.imageName,
        image: repository.uri,
        cpu: computingOption.availableCPU * 1024,
        memory: computingOption.availableMemory * 1024,
        essential: true,
        portMappings: [
          {
            // Container Port
            containerPort: containerPort,
            appProtocol: containerPortProtocol,
            // Exposed Port
            hostPort: exposedPort,
            protocol: exposedPortProtocol,
          },
        ],
        environment:
          environmentVariables?.map((env) => {
            return { name: env.key, value: env.value };
          }) || undefined,
      },
    ],
    ephemeralStorage: {
      sizeInGiB: storageOption.storageSize,
    },
    requiresCompatibilities: ["FARGATE"],
    cpu: computingOption.availableCPU * 1024 + "",
    memory: computingOption.availableMemory * 1024 + "",
  };

  return taskDefinitionParams;
};

const getOpratingSystemConfig = (os: string): RuntimePlatform => {
  let cpuArchitecture: CPUArchitecture = "X86_64";
  let operatingSystemFamily: OSFamily = "LINUX";

  const selectedOS = os.toUpperCase();

  if (selectedOS.startsWith("LINUX")) {
    operatingSystemFamily = "LINUX";

    if (selectedOS.endsWith("X86_64")) {
      cpuArchitecture = "X86_64";
    } else if (selectedOS.endsWith("ARM64")) {
      cpuArchitecture = "ARM64";
    }
  }

  if (selectedOS.startsWith("WINDOWS")) {
    cpuArchitecture = "X86_64";

    if (selectedOS.endsWith("2019_CORE")) {
      operatingSystemFamily = "WINDOWS_SERVER_2019_CORE";
    } else if (selectedOS.endsWith("2019_FULL")) {
      operatingSystemFamily = "WINDOWS_SERVER_2019_FULL";
    } else if (selectedOS.endsWith("2022_CORE")) {
      operatingSystemFamily = "WINDOWS_SERVER_2022_CORE";
    } else if (selectedOS.endsWith("2022_FULL")) {
      operatingSystemFamily = "WINDOWS_SERVER_2022_FULL";
    }
  }

  return {
    cpuArchitecture,
    operatingSystemFamily,
  };
};
