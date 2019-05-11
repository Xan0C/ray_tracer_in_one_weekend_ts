import * as fs from 'fs';
import { Ray } from './ray';
import { vec3 } from 'gl-matrix';
import { Hitable, HitableList } from './hitable';
import { Sphere } from './sphere';
import {Camera} from "./camera";
import {Lambertian} from "./lambertian";
import {Metal} from "./metal";
import {Dielectric} from "./dielectric";
const mkdirp = require('mkdirp');

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

function image(camera: Camera, world: HitableList, width?: number, height?: number, rays?: number): string {
    const nx = width || 200;
    const ny = height || 100;
    const ns = rays || 100;

    let imageData = `P3\n${nx} ${ny}\n255\n`;

    for (let j = ny - 1; j >= 0; j--) {
        for (let i = 0; i < nx; i++) {
            const c = vec3.create();
            for(let s = 0; s < ns; s++) {
                const u = (i + Math.random()) / nx;
                const v = (j + Math.random()) / ny;
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

function randomWorld(n: number = 500): HitableList {
    const spheres:Sphere[] = [];
    spheres.push(new Sphere(vec3.fromValues(0, -n*2, 0), n*2, new Lambertian(vec3.fromValues(0.5, 0.5, 0.5))));
    const s = vec3.fromValues(4, 0.2, 0);

    for(let a = -11; a < 11; a++) {
        for(let b = -11; b < 11; b++) {
            const chooseMat = Math.random();
            const center = vec3.fromValues(a+0.9*Math.random(), 0.2, b+0.9*Math.random());
            const l = vec3.length(vec3.sub(vec3.create(), center, s));
            if (l > 0.9) {
                if (chooseMat < 0.8) {
                    spheres.push(
                        new Sphere(
                            center,
                            0.2,
                            new Lambertian(
                                vec3.fromValues(
                                    Math.random() * Math.random(),
                                    Math.random() * Math.random(),
                                    Math.random() * Math.random()
                                )
                            )
                        )
                    );
                } else if(chooseMat < 0.95) {
                    spheres.push(
                        new Sphere(
                            center,
                            0.2,
                            new Metal(
                                vec3.fromValues(
                                    0.5*(1 + Math.random()),
                                    0.5*(1 + Math.random()),
                                    0.5*(1 + Math.random())
                                ),
                                0.5 * Math.random()
                            )
                        )
                    );
                } else {
                    spheres.push(
                        new Sphere(
                            center,
                            0.2,
                            new Dielectric(1.5)
                        )
                    );
                }
            }
        }
    }

    spheres.push(new Sphere(vec3.fromValues(0, 1, 0), 1.0, new Dielectric(1.5)));
    spheres.push(new Sphere(vec3.fromValues(-4, 1, 0), 1.0, new Lambertian(vec3.fromValues(0.4, 0.2, 0.1))));
    spheres.push(new Sphere(vec3.fromValues(4, 1, 0), 1.0, new Metal(vec3.fromValues(0.7, 0.6, 0.5), 0.0)));

    return new HitableList(spheres);
}

// const world = new HitableList([
//     new Sphere(vec3.fromValues(0, 0, -1), 0.5, new Lambertian(vec3.fromValues(0.1, 0.2, 0.5))),
//     new Sphere(vec3.fromValues(0, -100.5, -1), 100, new Lambertian(vec3.fromValues(0.8, 0.8, 0.0))),
//     new Sphere(vec3.fromValues(1, 0, -1), 0.5, new Metal(vec3.fromValues(0.8, 0.6, 0.2))),
//     new Sphere(vec3.fromValues(-1, 0, -1), 0.5, new Dielectric(1.5)),
//     new Sphere(vec3.fromValues(-1, 0, -1), -0.425, new Dielectric(1.5)),
// ]);

const world = randomWorld();

const lookfrom = vec3.fromValues(13,2,3);
const lookat = vec3.fromValues(0,0,0);
const distToFocus = 10; //vec3.length(vec3.sub(vec3.create(), lookfrom, lookat));
const aperture = 0.1;

const nx = 1200;
const ny = 800;
const ns = 10;
const camera = new Camera(lookfrom, lookat, vec3.fromValues(0,1,0), 20, nx/ny, aperture, distToFocus);

mkdirp.sync('output/');
fs.writeFile('output/image.ppm', image(camera, world, nx, ny, ns), { flag: 'w+' }, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    process.exit(0);
});
