import * as fs from 'fs';
import { Ray } from './ray';
import { vec3 } from 'gl-matrix';
import { Hitable, HitableList } from './hitable';
import { Sphere } from './sphere';
import {Camera} from "./camera";
import {Lambertian} from "./lambertian";
import {Metal} from "./metal";
import {Dielectric} from "./dielectric";
import {createCluster} from "./cluster/cluster";
const mkdirp = require('mkdirp');

type WorkerProps = {
    width: number,
    height: number,
    nyFrom: number,
    nyTo: number,
    rays: number,
    index: number,
    world: SphereProps[]
}

type SphereProps = {
    center: number[],
    radius: number,
    material: {
        name: string,
        albedo?: number[],
        fuzz?: number,
        refractiveIndex?: number
    }
}

function color(ray: Ray, world: Hitable, depth: number): vec3 {
    const hitRecord = world.hit(ray, 0.001, Infinity);
    if (hitRecord) {
        if(depth < 50) {
            const scat = hitRecord.material.scatter(ray, hitRecord);
            if(scat.valid) {
                return vec3.mul(vec3.create(), scat.attenuation, color(scat.scattered, world, depth+1));
            }
        }
        return vec3.fromValues(0,0,0);
    } else {
        const unit_dir = vec3.normalize(vec3.create(), ray.direction);
        const t = 0.5 * (unit_dir[1] + 1.0);
        return vec3.add(
            vec3.create(),
            vec3.fromValues(1.0 - t, 1.0 - t, 1.0 - t),
            vec3.fromValues(0.5 * t, 0.7 * t, t)
        );
    }
}

function imageHead(width?: number, height?: number): string {
    const nx = width || 200;
    const ny = height || 100;
    return `P3\n${nx} ${ny}\n255\n`;
}

function image(camera: Camera, world: HitableList, props: WorkerProps): string {
    const nx = props.width || 200;
    const ny = props.nyFrom || 100;
    const ns = props.rays || 100;

    let imageData = "";

    for (let j = ny - 1; j >= props.nyTo; j--) {
        for (let i = 0; i < nx; i++) {
            const c = vec3.create();
            for(let s = 0; s < ns; s++) {
                const u = (i + Math.random()) / props.width;
                const v = (j + Math.random()) / props.height;
                const ray = camera.getRay(u, v);
                vec3.add(c, c, color(ray, world, 0));
            }
            vec3.scale(c, c, 1 / ns);
            c[0] = Math.sqrt(c[0]);
            c[1] = Math.sqrt(c[1]);
            c[2] = Math.sqrt(c[2]);
            let ir = Math.floor(255.99 * c[0]);
            let ig = Math.floor(255.99 * c[1]);
            let ib = Math.floor(255.99 * c[2]);

            imageData += `${ir} ${ig} ${ib}\n`;
        }
    }
    return imageData;
}

function randomWorld(n: number = 500): SphereProps[] {
    const objects: SphereProps[] = [];
    objects.push({
        center: [0, -n*2, 0],
        radius: n*2,
        material: {
            name: "Lambertian",
            albedo: [0.5, 0.5, 0.5]
        }
    });

    const s = vec3.fromValues(4, 0.2, 0);

    for(let a = -11; a < 11; a++) {
        for(let b = -11; b < 11; b++) {
            const chooseMat = Math.random();
            const center = vec3.fromValues(a+0.9*Math.random(), 0.2, b+0.9*Math.random());
            const l = vec3.length(vec3.sub(vec3.create(), center, s));
            if (l > 0.9) {
                if (chooseMat < 0.8) {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: "Lambertian",
                            albedo: [
                                Math.random() * Math.random(),
                                Math.random() * Math.random(),
                                Math.random() * Math.random()
                            ]
                        }
                    });
                } else if(chooseMat < 0.95) {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: "Metal",
                            albedo: [
                                0.5*(1 + Math.random()),
                                0.5*(1 + Math.random()),
                                0.5*(1 + Math.random())
                            ],
                            fuzz:  0.5 * Math.random()
                        }
                    });
                } else {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: "Dielectric",
                            refractiveIndex: 1.5
                        }
                    });
                }
            }
        }
    }

    objects.push({
        center: [0, 1, 0],
        radius: 1.0,
        material: {
            name: "Dielectric",
            refractiveIndex: 1.5
        }
    });

    objects.push({
        center: [-4, 1, 0],
        radius: 1.0,
        material: {
            name: "Lambertian",
            albedo: [0.4, 0.2, 0.1]
        }
    });

    objects.push({
        center: [4, 1, 0],
        radius: 1.0,
        material: {
            name: "Metal",
            albedo: [0.7, 0.6, 0.5],
            fuzz: 0.0
        }
    });

    return objects;
}

function createWorld(objects: SphereProps[]): HitableList {
    const spheres: Sphere[] = [];

    for(let i=0; i < objects.length; i++) {
        const object = objects[i];

        if(object.material.name === "Lambertian") {
            spheres.push(new Sphere(
                vec3.fromValues(object.center[0], object.center[1], object.center[2]),
                object.radius,
                new Lambertian(vec3.fromValues(object.material.albedo[0], object.material.albedo[1], object.material.albedo[2]))
            ));
        }else if(object.material.name === "Metal") {
            spheres.push(new Sphere(
                vec3.fromValues(object.center[0], object.center[1], object.center[2]),
                object.radius,
                new Metal(vec3.fromValues(object.material.albedo[0], object.material.albedo[1], object.material.albedo[2]), object.material.fuzz)
            ));
        }else if(object.material.name === "Dielectric") {
            spheres.push(new Sphere(
                vec3.fromValues(object.center[0], object.center[1], object.center[2]),
                object.radius,
                new Dielectric(object.material.refractiveIndex)
            ));
        }
    }

    return new HitableList(spheres);
}

const startTime = process.hrtime();

const nx = 1200;
const ny = 800;
const ns = 10;

const lookfrom = vec3.fromValues(13,2,3);
const lookat = vec3.fromValues(0,0,0);
const distToFocus = vec3.length(vec3.sub(vec3.create(), lookfrom, lookat));
const aperture = 0.1;
const camera = new Camera(lookfrom, lookat, vec3.fromValues(0,1,0), 20, nx/ny, aperture, distToFocus);

let childIsWorking = false;

const master = createCluster((pusher, data) => {
    if(!childIsWorking) {
        const job: WorkerProps = JSON.parse(data);
        pusher.send(JSON.stringify({pid: process.pid, working: true, index: job.index}));
        childIsWorking = true;
        console.log(`Child job index ${job.index} width ${job.width} height ${job.height} nyFrom ${job.nyFrom} nyTo ${job.nyTo}`);
        const world = createWorld(job.world);
        const imageData = image(camera, world, job);
        pusher.send(JSON.stringify({pid: process.pid, done: true, data: imageData, index: job.index}));
    }
});

if(master) {
    const world = randomWorld();

    let jobCount = 0;
    let finishedJobs = 0;
    let cumulatedDecimal = 0;
    const workerData: WorkerProps[] = [];
    const nyStep = ny / master.count;
    const decimal = (ny / master.count) - Math.floor(nyStep);

    for(let i = 0; i < master.count; i++) {
        const nyFrom = Math.max(0, Math.floor(ny - nyStep*i - cumulatedDecimal));
        cumulatedDecimal += decimal;
        const nyTo = Math.max(0, Math.floor(ny - nyStep*(i+1) - cumulatedDecimal));

        workerData.push({
            width: nx,
            height: ny,
            nyFrom,
            nyTo,
            rays: ns,
            index: i,
            world
        });
    }

    const head = imageHead(nx, ny);
    const imageData: string[] = [];

    const jobs:any[] = [];

    master.puller.on('message', (data) => {
        const job:{ready?: boolean, working?: boolean, pid: number, done: boolean, data:string, index: number} = JSON.parse(data);

        if(job.ready) {
            if(jobCount < master.count) {
                const interval = setInterval((index) => {
                    master.pusher.send(JSON.stringify(workerData[index]));
                }, 1000, jobCount);
                jobs[jobCount] = interval;
                jobCount++;
            }
        }

        if(job.working) {
            clearInterval(jobs[job.index]);
        }

        if(job.done) {
            imageData[job.index] = job.data;
            finishedJobs++;
        }

        if(finishedJobs >= master.count) {
            console.log('All done ');
            writeToFile(head, imageData);
        }
    });
}

function writeToFile(head: string, imageData: string[]): void {
    mkdirp.sync('output/');

    let image = head;

    for(let i = 0; i < imageData.length; i++) {
        image += imageData[i];
    }

    fs.writeFile('output/image.ppm', image, { flag: 'w+' }, err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        const endTime = process.hrtime(startTime);
        console.info('Execution time (hr): %ds %dms', endTime[0], endTime[1] / 1000000);
        process.exit(0);
    });
}
