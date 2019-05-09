import { vec3 } from 'gl-matrix';
import { Ray } from './ray';

export class Camera {
    private _lower_left_corner: vec3;
    private _horizontal: vec3;
    private _vertical: vec3;
    private _origin: vec3;

    constructor() {
        this._lower_left_corner = vec3.fromValues(-2, -1, -1);
        this._horizontal = vec3.fromValues(4, 0, 0);
        this._vertical = vec3.fromValues(0, 2, 0);
        this._origin = vec3.fromValues(0, 0, 0);
    }

    getRay(u: number, v: number): Ray {
        const uScaleHorizontal = vec3.scale(vec3.create(), this._horizontal, u);
        const vScaleVertical = vec3.scale(vec3.create(), this._vertical, v);
        const direction = vec3.add(
            vec3.create(),
            this._lower_left_corner,
            vec3.add(vec3.create(), uScaleHorizontal, vScaleVertical)
        );
        return new Ray(this._origin, direction);
    }
}
