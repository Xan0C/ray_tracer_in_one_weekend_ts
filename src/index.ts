import * as fs from 'fs';
import { Ray } from './ray';
import { vec3 } from 'gl-matrix';
import { Hitable, HitableList } from './hitable';
import { Sphere } from './sphere';

const color = (ray: Ray, world: Hitable) => {
    const hitRecord = world.hit(ray, 0, 99999);
    if (hitRecord) {
        return vec3.fromValues(
            0.5 * (hitRecord.normal[0] + 1),
            0.5 * (hitRecord.normal[1] + 1),
            0.5 * (hitRecord.normal[2] + 1),
        );
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

    let imageData = `P3\n${nx} ${ny}\n255\n`;

    const lower_left_corner = vec3.fromValues(-2, -1, -1);
    const horizontal = vec3.fromValues(4, 0, 0);
    const vertical = vec3.fromValues(0, 2, 0);
    const origin = vec3.fromValues(0, 0, 0);

    const world = new HitableList([
        new Sphere(vec3.fromValues(0, 0, -1), 0.5),
        new Sphere(vec3.fromValues(0, -100.5, -1), 100),
    ]);

    for (let j = ny - 1; j >= 0; j--) {
        for (let i = 0; i < nx; i++) {
            const u = i / nx;
            const v = j / ny;

            const uScaleHorizontal = vec3.scale(vec3.create(), horizontal, u);
            const vScaleVertical = vec3.scale(vec3.create(), vertical, v);
            const direction = vec3.add(
                vec3.create(),
                lower_left_corner,
                vec3.add(vec3.create(), uScaleHorizontal, vScaleVertical)
            );
            const ray = new Ray(origin, direction);

            const c = color(ray, world);

            // c[0] = Math.abs(c[0]);
            // c[1] = Math.abs(c[1]);
            // c[2] = Math.abs(c[2]);

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
