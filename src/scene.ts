export interface CameraProps {
    lookfrom: number[];
    lookat: number[];
    up: number[];
    vfov: number;
    aspect: number;
    aperture: number;
    distToFocus: number;
}

const width = 1200;
const height = 800;
const rays = 10;
const camera: CameraProps = {
    lookfrom: [13, 2, 3],
    lookat: [0, 0, 0],
    up: [0, 1, 0],
    vfov: 20,
    aspect: width / height,
    aperture: 0.1,
    distToFocus: 10.0,
};

export const Scene = {
    width,
    height,
    rays,
    camera,
};
