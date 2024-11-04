import {
    CreateRepositoryCommand,
    DeleteRepositoryCommand,
    DescribeImagesCommand,
    DescribeRepositoriesCommand,
    ECRClient,
    GetAuthorizationTokenCommand
} from "@aws-sdk/client-ecr";
import {CONSTANT} from "../../../constant";
import {getDefaultCredentials} from "./credentials";
import * as util from "node:util";
import {exec} from "node:child_process";
import {pullImageFromDockerHub} from "../docker/docker";

const client = new ECRClient({region: CONSTANT.AWS_REGION, credentials: getDefaultCredentials()});
const execAsync = util.promisify(exec);

const getRepositoryName = (username: string, imageName: string): string => `deploythings/${username}/${imageName}`;

const authenticateECR = async () => {
    const authTokenCommand = new GetAuthorizationTokenCommand({});
    const authTokenResponse = await client.send(authTokenCommand);

    const authData = authTokenResponse.authorizationData?.[0];
    if (!authData) throw new Error("No authorization data found");

    const decodedAuth = Buffer.from(authData.authorizationToken!, "base64").toString();
    const [username, password] = decodedAuth.split(":");

    await execAsync(`docker login -u ${username} -p ${password} ${authData.proxyEndpoint}`);
};

const logoutFromECR = async (repositoryUri: string) => {
    await execAsync(`docker logout ${repositoryUri}`);
};

export const createECRRepository = async (username: string, imageName: string) => {
    const repositoryName = getRepositoryName(username, imageName);
    const createCommand = new CreateRepositoryCommand({repositoryName});

    try {
        return await client.send(createCommand);
    } catch (error) {
        console.error("Error creating ECR repository:", error);
        throw error;
    }
};

const getECRImageDetails = async (repositoryName: string, imageTag = "latest") => {
    const describeImagesCommand = new DescribeImagesCommand({
        repositoryName,
        imageIds: [{imageTag}],
    });

    try {
        const response = await client.send(describeImagesCommand);
        return response.imageDetails?.[0] || null;
    } catch (error) {
        console.error("Error retrieving image details:", error);
        throw error;
    }
};

export const uploadImageToECR = async (
    {
        imageName,
        repositoryName,
        repositoryUri,
        dockerHubAccessToken
    }: {
        imageName: string;
        repositoryName: string;
        repositoryUri: string;
        dockerHubAccessToken?: string;
    }) => {
    try {
        await pullImageFromDockerHub(imageName, dockerHubAccessToken);
        await authenticateECR();

        await execAsync(`docker tag ${imageName}:latest ${repositoryUri}:latest`);
        await execAsync(`docker push ${repositoryUri}:latest`);
    } catch (error) {
        console.error("Error uploading image to ECR:", error);
        throw error;
    } finally {
        await logoutFromECR(repositoryUri);
    }

    const imageDetails = await getECRImageDetails(repositoryName);
    if (!imageDetails) {
        throw new Error(`Image ${imageName} not found in repository ${repositoryUri}`);
    }

    return imageDetails;
};

export const listECRRepositories = async () => {
    const describeRepositoriesCommand = new DescribeRepositoriesCommand({});

    try {
        const response = await client.send(describeRepositoriesCommand);
        return response.repositories;
    } catch (error) {
        console.error("Error listing ECR repositories:", error);
        throw error;
    }
};

export const deleteECRRepository = async ({repositoryName}: { repositoryName: string }) => {
    const command = new DeleteRepositoryCommand({
        repositoryName,
        force: true
    });

    try {
        return await client.send(command);
    } catch (error) {
        console.error("Error deleting repository:", error);
        throw error;
    }
}