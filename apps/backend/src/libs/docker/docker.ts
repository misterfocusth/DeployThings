import Docker from 'dockerode';

const docker = new Docker();

export const pullImageFromDockerHub = async (imageName: string, accessToken?: string): Promise<void> => {
    console.log(`Pulling image ${imageName} from Docker Hub...`);

    const auth = {key: accessToken || ''};

    docker.pull(imageName, {authconfig: auth}, (err, stream) => {
        if (err) throw err;

        return new Promise((resolve, reject) => {
            if (!stream) return reject(new Error('No stream returned from Docker pull.'));

            docker.modem.followProgress(stream, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            })
        });
    });

    console.log(`Pulled ${imageName} from Docker Hub successfully.`);
}