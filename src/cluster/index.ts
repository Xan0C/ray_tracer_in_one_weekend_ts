import { vec3 } from 'gl-matrix';
import { Camera } from '../camera';
import { createCluster } from './cluster';
import { createImage, createImageHead, ImageProps } from '../raytracer';
import { createRandomSpheres, createWorld, SphereProps } from '../world';
import { writeImageToFile } from '../fileUtil';
import { Scene } from '../scene';

interface WorkerProps extends ImageProps {
    index: number;
    world: SphereProps[];
}

export function runCluster() {
    const startTime = process.hrtime();

    const nx = Scene.width;
    const ny = Scene.height;
    const ns = Scene.rays;

    const camera = new Camera(
        vec3.fromValues(
            Scene.camera.lookfrom[0],
            Scene.camera.lookfrom[1],
            Scene.camera.lookfrom[2]
        ),
        vec3.fromValues(
            Scene.camera.lookat[0],
            Scene.camera.lookat[1],
            Scene.camera.lookat[2]
        ),
        vec3.fromValues(
            Scene.camera.up[0],
            Scene.camera.up[1],
            Scene.camera.up[2]
        ),
        Scene.camera.vfov,
        Scene.camera.aspect,
        Scene.camera.aperture,
        Scene.camera.distToFocus
    );

    let childIsWorking = false;

    const master = createCluster((pusher, data) => {
        if (!childIsWorking) {
            const job: WorkerProps = JSON.parse(data);
            pusher.send(
                JSON.stringify({
                    pid: process.pid,
                    working: true,
                    index: job.index,
                })
            );
            childIsWorking = true;
            const world = createWorld(job.world);
            const imageData = createImage(camera, world, job);
            pusher.send(
                JSON.stringify({
                    pid: process.pid,
                    done: true,
                    data: imageData,
                    index: job.index,
                })
            );
        }
    });

    if (master) {
        const world = createRandomSpheres();

        let jobCount = 0;
        let finishedJobs = 0;
        let cumulatedDecimal = 0;
        const workerData: WorkerProps[] = [];
        const nyStep = ny / master.count;
        const decimal = ny / master.count - Math.floor(nyStep);

        for (let i = 0; i < master.count; i++) {
            const nyFrom = Math.max(
                0,
                Math.floor(ny - nyStep * i - cumulatedDecimal)
            );
            cumulatedDecimal += decimal;
            const nyTo = Math.max(
                0,
                Math.floor(ny - nyStep * (i + 1) - cumulatedDecimal)
            );

            workerData.push({
                width: nx,
                height: ny,
                nyFrom,
                nyTo,
                rays: ns,
                index: i,
                world,
            });
        }

        const head = createImageHead(nx, ny);
        const imageData: string[] = [];

        const jobs: any[] = [];

        master.puller.on('message', data => {
            const job: {
                ready?: boolean;
                working?: boolean;
                pid: number;
                done: boolean;
                data: string;
                index: number;
            } = JSON.parse(data);

            if (job.ready) {
                if (jobCount < master.count) {
                    const interval = setInterval(
                        index => {
                            master.pusher.send(
                                JSON.stringify(workerData[index])
                            );
                        },
                        1000,
                        jobCount
                    );
                    jobs[jobCount] = interval;
                    jobCount++;
                }
            }

            if (job.working) {
                clearInterval(jobs[job.index]);
            }

            if (job.done) {
                imageData[job.index] = job.data;
                finishedJobs++;
            }

            if (finishedJobs >= master.count) {
                writeImageToFile(head, imageData, startTime);
            }
        });
    }
}
