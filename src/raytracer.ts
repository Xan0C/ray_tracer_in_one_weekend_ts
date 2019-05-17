import { Ray } from './ray';
import { Hitable, HitableList } from './hitable';
import { vec3 } from 'gl-matrix';
import { Camera } from './camera';

export type ImageProps = {
    width: number;
    height: number;
    nyFrom: number;
    nyTo: number;
    rays: number;
};

function color(ray: Ray, world: Hitable, depth: number): vec3 {
    const hitRecord = world.hit(ray, 0.001, Infinity);
    if (hitRecord) {
        if (depth < 50) {
            const scat = hitRecord.material.scatter(ray, hitRecord);
            if (scat.valid) {
                return vec3.mul(
                    vec3.create(),
                    scat.attenuation,
                    color(scat.scattered, world, depth + 1)
                );
            }
        }
        return vec3.fromValues(0, 0, 0);
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

export function createImageHead(width?: number, height?: number): string {
    const nx = width || 200;
    const ny = height || 100;
    return `P3\n${nx} ${ny}\n255\n`;
}

export function createImage(
    camera: Camera,
    world: HitableList,
    props: ImageProps
): string {
    const nx = props.width || 200;
    const ny = props.nyFrom || 100;
    const ns = props.rays || 100;

    let imageData = '';

    for (let j = ny - 1; j >= props.nyTo; j--) {
        for (let i = 0; i < nx; i++) {
            const c = vec3.create();
            for (let s = 0; s < ns; s++) {
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
