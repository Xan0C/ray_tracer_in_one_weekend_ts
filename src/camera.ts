import {vec3} from 'gl-matrix';
import {Ray} from './ray';
import {vec3Math} from "./math";

export class Camera {
    private _lower_left_corner: vec3;
    private _horizontal: vec3;
    private _vertical: vec3;
    private _origin: vec3;
    private _lens_radius: number;
    private v: vec3;
    private u: vec3;
    private w: vec3;

    /**
     *
     * @param {number} vfov - degress from top to bottom
     * @param {number} aspect
     */
    constructor(lookfrom: vec3, lookat: vec3, up: vec3, vfov: number, aspect: number, aperture: number, focusDist: number) {
        this._lens_radius = aperture / 2;
        const theta = vfov * Math.PI / 180; //to radians
        const halfHeight = Math.tan(theta / 2); //h
        const halfWidth = aspect * halfHeight;

        this._origin = vec3.clone(lookfrom);
        const w = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), lookfrom, lookat)); //vektor von lookat nach lookfrom, also guckrichtung
        const u = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), up, w));
        const v = vec3.cross(vec3.create(), w, u);
        this.w = w;
        this.u = w;
        this.v = v;

        const fHwU = vec3.scale(vec3.create(), u, halfWidth*focusDist);
        const fHhV = vec3.scale(vec3.create(), v, halfHeight*focusDist);
        const fW = vec3.scale(vec3.create(), w, focusDist);
        this._lower_left_corner = vec3.sub(vec3.create(),
            this._origin,
            vec3.add(
                vec3.create(),
                fHwU,
                vec3.add(
                    vec3.create(),
                    fHhV,
                    fW
                )
            )
        );

        this._horizontal = vec3.scale(vec3.create(), u, 2*halfWidth*focusDist);
        this._vertical = vec3.scale(vec3.create(), v, 2*halfHeight*focusDist);
    }

    getRay(s: number, t: number): Ray {
        const rd = vec3.scale(vec3.create(), vec3Math.randomInUnitDisk(), this._lens_radius);
        const offset = vec3.add(
            vec3.create(),
            vec3.scale(vec3.create(), this.u, rd[0]),
            vec3.scale(vec3.create(), this.v, rd[1])
        );

        const uScaleHorizontal = vec3.scale(vec3.create(), this._horizontal, s);
        const vScaleVertical = vec3.scale(vec3.create(), this._vertical, t);
        const direction = vec3.add(
            vec3.create(),
            this._lower_left_corner,
            vec3.add(vec3.create(), uScaleHorizontal, vec3.sub(vec3.create(), vScaleVertical, this._origin))
        );
        return new Ray(vec3.add(vec3.create(), this._origin, offset), vec3.sub(vec3.create(), direction, offset));
    }
}
