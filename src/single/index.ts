import { createRandomSpheres, createWorld } from '../world';
import { Camera } from '../camera';
import { vec3 } from 'gl-matrix';
import { createImage, createImageHead } from '../raytracer';
import { writeImageToFile } from '../fileUtil';
import { Scene } from '../scene';

export function runSingle() {
    const startTime = process.hrtime();

    const width = Scene.width;
    const height = Scene.height;
    const rays = Scene.rays;

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
    const world = createWorld(createRandomSpheres());
    const head = createImageHead(width, height);
    const image = createImage(camera, world, {
        height,
        width,
        nyFrom: height,
        nyTo: 0,
        rays,
    });

    writeImageToFile(head, [image], startTime);
}
