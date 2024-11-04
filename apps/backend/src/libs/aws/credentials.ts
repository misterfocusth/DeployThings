import {AwsCredentialIdentity} from "@aws-sdk/types";

export const getDefaultCredentials = (): AwsCredentialIdentity => {
    return {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
}