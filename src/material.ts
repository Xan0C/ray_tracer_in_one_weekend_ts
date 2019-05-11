import {Ray} from "./ray";
import {HitRecord} from "./hitable";
import {vec3} from "gl-matrix";

export interface Scatter {
    attenuation: vec3;
    scattered: Ray;
    valid?: boolean;
}

export interface Material {
    /**
     * @param {Ray} ray
     * @param {HitRecord} hitRecord
     * @returns {boolean}
     */
    scatter(ray: Ray, hitRecord: HitRecord): Scatter;
}