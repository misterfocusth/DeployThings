import {CreateRepositoryCommand, DescribeRepositoriesCommand, ECRClient} from "@aws-sdk/client-ecr";
import {CONSTANT} from "../../../constant";
import {getDefaultCredentials} from "./credentials";

const credentials = getDefaultCredentials()
const client = new ECRClient({region: CONSTANT.AWS_REGION, credentials: credentials})

export const createECRRepository = async (repositoryName: string) => {
    const command = new CreateRepositoryCommand({
        repositoryName: repositoryName,
    })

    try {
        return await client.send(command)
    } catch (error) {
        console.error(error)
        throw error
    }
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