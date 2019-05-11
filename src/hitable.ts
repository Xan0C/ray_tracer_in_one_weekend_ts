import { Ray } from './ray';
import { vec3 } from 'gl-matrix';
import {Material} from "./material";

export type HitRecord = {
    t: number;
    p: vec3;
    normal: vec3;
    material: Material;
};

export interface Hitable {
    hit(ray: Ray, t_min: number, t_max: number): HitRecord;
}

export class HitableList implements Hitable {
    private _hitables: Hitable[];

    constructor(list: Hitable[] = []) {
        this._hitables = list;
    }

    hit(ray: Ray, t_min: number, t_max: number): HitRecord | null {
        let closestHitRecord = null;
        let closestSoFar = t_max;
        for (let i = 0; i < this._hitables.length; i++) {
            const hitable = this._hitables[i];
            const hitRecord = hitable.hit(ray, t_min, closestSoFar);
            if (hitRecord) {
                closestHitRecord = hitRecord;
                closestSoFar = hitRecord.t;
            }
        }

        return closestHitRecord;
    }
}
