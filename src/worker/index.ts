import { Worker } from 'worker_threads';
import * as Comlink from 'comlink';
import nodeEndpoint from 'comlink/dist/umd/node-adapter';
import { createRandomSpheres, SphereProps } from '../world';
import { WorkerProps } from './workerFunction';
import { writeImageToFile } from '../fileUtil';
import { createImageHead } from '../raytracer';
import { Scene } from '../scene';

export function runWorker() {
    async function raytrace(workerProps: WorkerProps[]): Promise<string[]> {
        const workerResults = [];
        for (let i = 0; i < workerProps.length; i++) {
            const worker = new Worker('./lib/worker/nodeWorker.js');
            //@ts-ignore
            const api = Comlink.wrap(nodeEndpoint(worker));
            //@ts-ignore
            workerResults.push(api.traceImage(workerProps[i]));
        }
        return Promise.all(workerResults) as Promise<string[]>;
    }

    function createWorkerProps(
        width: number,
        height: number,
        rays: number,
        world: SphereProps[],
        workers: number
    ): WorkerProps[] {
        let cumulatedDecimal = 0;
        const workerData: WorkerProps[] = [];
        const nyStep = height / workers;
        const decimal = height / workers - Math.floor(nyStep);

        for (let i = 0; i < workers; i++) {
            const nyFrom = Math.max(
                0,
                Math.floor(height - nyStep * i - cumulatedDecimal)
            );
            cumulatedDecimal += decimal;
            const nyTo = Math.max(
                0,
                Math.floor(height - nyStep * (i + 1) - cumulatedDecimal)
            );

            workerData.push({
                width: width,
                height: height,
                nyFrom,
                nyTo,
                rays: rays,
                world,
            });
        }

        return workerData;
    }

    const startTime = process.hrtime();

    const workers = 12;
    const width = Scene.width;
    const height = Scene.height;
    const rays = Scene.rays;

    const world = createRandomSpheres();
    const workerProps = createWorkerProps(width, height, rays, world, workers);

    raytrace(workerProps).then((images: string[]) => {
        const head = createImageHead(width, height);
        writeImageToFile(head, images, startTime);
    });
}
