import { Hitable, HitRecord } from './hitable';
import { Ray } from './ray';
import { vec3 } from 'gl-matrix';

export class Sphere implements Hitable {
    private _center: vec3;
    private _radius: number;

    constructor(center: vec3 = vec3.create(), radius: number = 0) {
        this._center = center;
        this._radius = radius;
    }

    hit(ray: Ray, t_min: number, t_max: number): HitRecord | null {
        const oc = vec3.sub(vec3.create(), ray.origin, this._center);
        const a = vec3.dot(ray.direction, ray.direction);
        const b = vec3.dot(oc, ray.direction);
        const c = vec3.dot(oc, oc) - (this._radius * this._radius);
        const discriminant = b*b - a*c;

        if (discriminant > 0) {
            const tempNeg = (-b - Math.sqrt(b * b - a * c)) / a;
            if (tempNeg < t_max && tempNeg > t_min) {
                const t = tempNeg;
                const p = ray.pointAtParameter(t);
                const normal = vec3.scale(
                    vec3.create(),
                    vec3.sub(vec3.create(), p, this._center),
                    1 / this._radius
                );
                return { t, p, normal };
            }
            const tempPos = (-b + Math.sqrt(b * b - a * c)) / a;
            if(tempPos < t_max && tempPos > t_min) {
                const t = tempPos;
                const p = ray.pointAtParameter(t);
                const normal = vec3.scale(
                    vec3.create(),
                    vec3.sub(vec3.create(), p, this._center),
                    1 / this._radius
                );
                return { t, p, normal };
            }
        }
        return null;
    }

    static randomInUnitSphere(): vec3 {
        let p: vec3;

        do {
            p = vec3.fromValues(Math.random()*2.0 - 1, Math.random()*2.0 - 1, Math.random()*2.0 - 1);
        } while(vec3.squaredLength(p) >= 1.0);

        return p;
    }
}
