import {Material, Scatter} from "./material";
import {HitRecord} from "./hitable";
import {Ray} from "./ray";
import {vec3} from "gl-matrix";
import {Sphere} from "./sphere";

export class Lambertian implements Material {

    private _albedo: vec3;

    constructor(albedo: vec3) {
        this._albedo = vec3.clone(albedo);
    }

    scatter(ray: Ray, hitRecord: HitRecord): Scatter {
        const target = vec3.add(
            vec3.create(),
            hitRecord.p,
            vec3.add(
                vec3.create(),
                hitRecord.normal,
                Sphere.randomInUnitSphere()
            )
        );
        const scattered = new Ray(hitRecord.p, vec3.sub(vec3.create(), target, hitRecord.p));
        const attenuation = vec3.clone(this._albedo);

        return {scattered, attenuation, valid: true};
    }
}