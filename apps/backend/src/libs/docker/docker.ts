import Docker from 'dockerode';

const docker = new Docker();

export const pullImageFromDockerHub = async (imageName: string, accessToken?: string): Promise<void> => {
    const auth = {key: accessToken || ''};

    docker.pull(imageName, {authconfig: auth}, (err, stream) => {
        if (err) throw err;

        return new Promise((resolve, reject) => {
            // eslint-disable-next-line
            const onFinished = (err: any, output: any) => {
                if (err) reject(err);
                else {
                    console.log(`Pulled ${imageName} from Docker Hub successfully.`);
                    resolve(output);
                }
            }

            // eslint-disable-next-line
            const onProgress = (event: any) => {
                console.log(event);
            }

            if (!stream) {
                return reject(new Error(`Failed to pull ${imageName} from Docker Hub`));
            }

            docker.modem.followProgress(stream, onFinished, onProgress);
        });
    });
}
