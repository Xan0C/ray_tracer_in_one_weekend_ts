import { Camera } from '../camera';
import { vec3 } from 'gl-matrix';
import { createWorld, SphereProps } from '../world';
import { createImage } from '../raytracer';
import { Scene } from '../scene';

export interface WorkerProps {
    world: SphereProps[];
    width: number;
    height: number;
    nyFrom: number;
    nyTo: number;
    rays: number;
}

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
    vec3.fromValues(Scene.camera.up[0], Scene.camera.up[1], Scene.camera.up[2]),
    Scene.camera.vfov,
    Scene.camera.aspect,
    Scene.camera.aperture,
    Scene.camera.distToFocus
);

export function workerFunc(props: WorkerProps): string {
    const world = createWorld(props.world);
    return createImage(camera, world, props);
}
