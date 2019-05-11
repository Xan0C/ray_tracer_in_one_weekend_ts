import {Material, Scatter} from "./material";
import {Ray} from "./ray";
import {HitRecord} from "./hitable";
import {vec3} from "gl-matrix";
import {vec3Math} from "./math";
import {Sphere} from "./sphere";

export class Metal implements Material {

    private _albedo: vec3;
    private _fuzz:number;

    constructor(albedo: vec3, fuzz?: number) {
        this._albedo = vec3.clone(albedo);
        this._fuzz = fuzz < 1 ? fuzz : 1;
    }

    scatter(ray: Ray, hitRecord: HitRecord): Scatter {
        const reflected = vec3Math.reflect(
            vec3.normalize(vec3.create(), ray.direction),
            hitRecord.normal
        );

        const scattered = new Ray(
            hitRecord.p,
            vec3.add(
                reflected,
                reflected,
                vec3.scale(
                    vec3.create(),
                    Sphere.randomInUnitSphere(),
                    this._fuzz)
            )
        );

        const attenuation = vec3.clone(this._albedo);

        return {
            attenuation,
            scattered,
            valid: vec3.dot(scattered.direction, hitRecord.normal) > 0
        };
    }
}