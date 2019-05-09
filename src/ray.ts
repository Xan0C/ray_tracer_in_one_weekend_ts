import {vec3} from "gl-matrix";

export class Ray {

    private _origin: vec3;
    private _direction: vec3;

    constructor(origin?: vec3, direction?: vec3) {
        this._origin = origin;
        this._direction = direction;
    }

    pointAtParameter(t: number): vec3 {
        return vec3.add(vec3.create(), this._origin, vec3.scale(vec3.create(), this._direction, t));
    }

    get origin(): vec3 {
        return this._origin;
    }

    set origin(value: vec3) {
        this._origin = value;
    }

    get direction(): vec3 {
        return this._direction;
    }

    set direction(value: vec3) {
        this._direction = value;
    }
}