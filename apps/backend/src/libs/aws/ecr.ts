import {
    CreateRepositoryCommand,
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

const credentials = getDefaultCredentials()
const client = new ECRClient({region: CONSTANT.AWS_REGION, credentials: credentials})

const execAsync = util.promisify(exec);

const getRepositoryName = (username: string, imageName: string) => {
    return `deploythings/${username}/${imageName}`
}

export const createECRRepository = async (username: string, imageName: string) => {
    try {
        const repositoryName = getRepositoryName(username, imageName)
        const createCommand = new CreateRepositoryCommand({
            repositoryName: repositoryName,
        });

        return await client.send(createCommand);
    } catch (error) {
        console.log(error)
        throw error
    }
}

const authenticateECR = async () => {
    const authTokenCommand = new GetAuthorizationTokenCommand({})
    const authTokenResponse = await client.send(authTokenCommand)

    if (authTokenResponse.authorizationData && authTokenResponse.authorizationData.length > 0) {
        const {authorizationToken, proxyEndpoint} = authTokenResponse.authorizationData[0]

        const decodedAuth = Buffer.from(authorizationToken!, 'base64').toString()
        const [username, password] = decodedAuth.split(':');

        await execAsync(`docker login -u ${username} -p ${password} ${proxyEndpoint}`);
    } else {
        throw new Error('No authorization data found')
    }
}

async function logoutFromECR(repositoryUri: string) {
    await execAsync(`docker logout ${repositoryUri}`);
}

const getECRRepositoryDetails = async (repositoryName: string) => {
    try {
        const command = new DescribeImagesCommand({
            repositoryName,
            imageIds: [{imageTag: 'latest'}]
        });
        const response = await client.send(command);

        if (response.imageDetails && response.imageDetails.length > 0) {
            return response.imageDetails[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error retrieving image details:', error);
        throw error;
    }
}

export const uploadImageToECR = async (config: {
    imageName: string,
    repositoryName: string,
    repositoryUri: string,
    dockerHubAccessToken?: string
}) => {
    const {imageName, repositoryName, repositoryUri, dockerHubAccessToken} = config

    await pullImageFromDockerHub(imageName, dockerHubAccessToken)
    await authenticateECR()
    
    await execAsync(`docker tag ${imageName}:latest ${repositoryUri}:latest`);
    await execAsync(`docker push ${repositoryUri}:latest`);

    await logoutFromECR(repositoryUri)

    const imageDetails = await getECRRepositoryDetails(repositoryName)

    if (!imageDetails) {
        throw new Error(`Image ${imageName} not found in repository ${repositoryUri}`)
    }

    return imageDetails
}

export const listECRRepositories = async () => {
    const command = new DescribeRepositoriesCommand({});
    try {
        return await client.send(command)
    } catch (error) {
        console.error(error)
        throw error
    }
}