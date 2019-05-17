import { vec3 } from 'gl-matrix';
import { HitableList } from './hitable';
import { Sphere } from './sphere';
import { Lambertian } from './lambertian';
import { Metal } from './metal';
import { Dielectric } from './dielectric';

export type SphereProps = {
    center: number[];
    radius: number;
    material: {
        name: string;
        albedo?: number[];
        fuzz?: number;
        refractiveIndex?: number;
    };
};

export function createRandomSpheres(n: number = 500): SphereProps[] {
    const objects: SphereProps[] = [];
    objects.push({
        center: [0, -n * 2, 0],
        radius: n * 2,
        material: {
            name: 'Lambertian',
            albedo: [0.5, 0.5, 0.5],
        },
    });

    const s = vec3.fromValues(4, 0.2, 0);

    for (let a = -11; a < 11; a++) {
        for (let b = -11; b < 11; b++) {
            const chooseMat = Math.random();
            const center = vec3.fromValues(
                a + 0.9 * Math.random(),
                0.2,
                b + 0.9 * Math.random()
            );
            const l = vec3.length(vec3.sub(vec3.create(), center, s));
            if (l > 0.9) {
                if (chooseMat < 0.8) {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: 'Lambertian',
                            albedo: [
                                Math.random() * Math.random(),
                                Math.random() * Math.random(),
                                Math.random() * Math.random(),
                            ],
                        },
                    });
                } else if (chooseMat < 0.95) {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: 'Metal',
                            albedo: [
                                0.5 * (1 + Math.random()),
                                0.5 * (1 + Math.random()),
                                0.5 * (1 + Math.random()),
                            ],
                            fuzz: 0.5 * Math.random(),
                        },
                    });
                } else {
                    objects.push({
                        center: [center[0], center[1], center[2]],
                        radius: 0.2,
                        material: {
                            name: 'Dielectric',
                            refractiveIndex: 1.5,
                        },
                    });
                }
            }
        }
    }

    objects.push({
        center: [0, 1, 0],
        radius: 1.0,
        material: {
            name: 'Dielectric',
            refractiveIndex: 1.5,
        },
    });

    objects.push({
        center: [-4, 1, 0],
        radius: 1.0,
        material: {
            name: 'Lambertian',
            albedo: [0.4, 0.2, 0.1],
        },
    });

    objects.push({
        center: [4, 1, 0],
        radius: 1.0,
        material: {
            name: 'Metal',
            albedo: [0.7, 0.6, 0.5],
            fuzz: 0.0,
        },
    });

    return objects;
}

export function createWorld(objects: SphereProps[]): HitableList {
    const spheres: Sphere[] = [];

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        if (object.material.name === 'Lambertian') {
            spheres.push(
                new Sphere(
                    vec3.fromValues(
                        object.center[0],
                        object.center[1],
                        object.center[2]
                    ),
                    object.radius,
                    new Lambertian(
                        vec3.fromValues(
                            object.material.albedo[0],
                            object.material.albedo[1],
                            object.material.albedo[2]
                        )
                    )
                )
            );
        } else if (object.material.name === 'Metal') {
            spheres.push(
                new Sphere(
                    vec3.fromValues(
                        object.center[0],
                        object.center[1],
                        object.center[2]
                    ),
                    object.radius,
                    new Metal(
                        vec3.fromValues(
                            object.material.albedo[0],
                            object.material.albedo[1],
                            object.material.albedo[2]
                        ),
                        object.material.fuzz
                    )
                )
            );
        } else if (object.material.name === 'Dielectric') {
            spheres.push(
                new Sphere(
                    vec3.fromValues(
                        object.center[0],
                        object.center[1],
                        object.center[2]
                    ),
                    object.radius,
                    new Dielectric(object.material.refractiveIndex)
                )
            );
        }
    }

    return new HitableList(spheres);
}
