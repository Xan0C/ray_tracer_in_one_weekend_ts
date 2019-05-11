import {Material, Scatter} from "./material";
import {HitRecord} from "./hitable";
import {Ray} from "./ray";
import {vec3Math} from "./math";
import {vec3} from "gl-matrix";

export class Dielectric implements  Material {

    private _refractiveIndex: number;

    constructor(refractiveIndex: number) {
        this._refractiveIndex = refractiveIndex;
    }

    scatter(ray: Ray, hitRecord: HitRecord): Scatter {
        const outwardNormal: vec3 = vec3.create();
        let niOverNt: number;
        let cosine: number;
        let reflectProb: number;
        let scattered: Ray;

        const reflected = vec3Math.reflect(ray.direction, hitRecord.normal);
        const attenuation = vec3.fromValues(1,1,1);

        if(vec3.dot(ray.direction, hitRecord.normal) > 0) {
            vec3.negate(outwardNormal, hitRecord.normal);
            niOverNt = this._refractiveIndex;
            cosine = this._refractiveIndex * vec3.dot(ray.direction, hitRecord.normal) / vec3.length(ray.direction);
        } else {
            vec3.copy(outwardNormal, hitRecord.normal);
            niOverNt = 1.0 / this._refractiveIndex;
            cosine =  -1 * vec3.dot(ray.direction, hitRecord.normal) / vec3.length(ray.direction);
        }

        const refracted = vec3Math.refract(ray.direction, outwardNormal, niOverNt);

        if(refracted) {
            reflectProb = vec3Math.schlick(cosine, this._refractiveIndex);
        } else {
            reflectProb = 1.0;
        }

        if(Math.random() < reflectProb) {
            scattered = new Ray(hitRecord.p, reflected);
        } else {
            scattered = new Ray(hitRecord.p, refracted);
        }

        return {
            scattered: scattered,
            attenuation: attenuation,
            valid: true
        };
    }
}