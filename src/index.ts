import * as fs from 'fs';
import { Ray } from './ray';
import { vec3 } from 'gl-matrix';
import { Hitable, HitableList } from './hitable';
import { Sphere } from './sphere';
import {Camera} from "./camera";

const color = (ray: Ray, world: Hitable): vec3 => {
    const hitRecord = world.hit(ray, 0.001, 99999);
    if (hitRecord) {
        const target = vec3.add(vec3.create(), hitRecord.p, vec3.add(vec3.create(), hitRecord.normal, Sphere.randomInUnitSphere()));
        return vec3.scale(vec3.create(), color(new Ray(hitRecord.p, vec3.sub(vec3.create(), target, hitRecord.p)), world), 0.5);
    } else {
        const unit_dir = vec3.normalize(vec3.create(), ray.direction);
        const t = 0.5 * (unit_dir[1] + 1.0);
        return vec3.add(
            vec3.create(),
            vec3.fromValues(1.0 - t, 1.0 - t, 1.0 - t),
            vec3.fromValues(0.5 * t, 0.7 * t, t)
        );
    }
};

const image: () => string = () => {
    const nx = 200;
    const ny = 100;
    const ns = 100;

    let imageData = `P3\n${nx} ${ny}\n255\n`;

    const world = new HitableList([
        new Sphere(vec3.fromValues(0, 0, -1), 0.5),
        new Sphere(vec3.fromValues(0, -100.5, -1), 100),
    ]);

    const camera = new Camera();

    for (let j = ny - 1; j >= 0; j--) {
        for (let i = 0; i < nx; i++) {
            const c = vec3.create();
            for(let s = 0; s < ns; s++) {
                const u = (i + Math.random()) / nx;
                const v = (j + Math.random()) / ny;
                const ray = camera.getRay(u, v);
                vec3.add(c, c, color(ray, world));
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
};

fs.writeFile('output/image.ppm', image(), { flag: 'w+' }, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    process.exit(0);
});
