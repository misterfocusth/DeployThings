import {
    CreateRepositoryCommand,
    DescribeImagesCommand,
    DescribeRepositoriesCommand,
    ECRClient,
    GetAuthorizationTokenCommand,
    ImageDetail
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
        console.log('Authenticated with ERC')
    } else {
        console.error('No authorization data found')
        throw new Error('No authorization data found')
    }
}

async function logoutFromECR(repositoryUri: string) {
    await execAsync(`docker logout ${repositoryUri}`);
}

const getECRImageDetails = async (repositoryName: string, imageName: string) => {
    let images: ImageDetail[] = [];
    let nextToken: string | undefined;

    try {
        do {
            const command = new DescribeImagesCommand({
                repositoryName,
                nextToken,
            });

            const response = await client.send(command);

            if (response.imageDetails) {
                images = images.concat(response.imageDetails);
            }

            nextToken = response.nextToken;
        } while (nextToken);
    } catch (error) {
        console.error(error)
        throw error
    }

    return images.find((image) => image.imageTags?.includes(imageName));
}

export const uploadImageToECR = async (imageName: string, dockerHubAccessToken: string, repositoryUri: string) => {
    await pullImageFromDockerHub(imageName, dockerHubAccessToken)

    await authenticateECR()

    console.log('Tag docker image...')
    await execAsync(`docker tag ${imageName}:latest ${repositoryUri}:latest`);

    console.log('Pushing docker image...')
    await execAsync(`docker push ${repositoryUri}:latest`);

    console.log('Logged out from ECR')
    await logoutFromECR(repositoryUri)

    console.log('Image pushed to ECR successfully')

    const imageDetails = await getECRImageDetails('deploythings/65070219', repositoryUri)

    if (!imageDetails) {
        throw new Error(`Image ${imageName} not found in repository ${repositoryUri}`)
    }

    console.log('Image details:', imageDetails)

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