import {vec3} from "gl-matrix";

export const vec3Math = {
    reflect(v: vec3, n: vec3): vec3 {
        return vec3.sub(
            vec3.create(),
            v,
            vec3.scale(
                vec3.create(),
                n,
                2 * vec3.dot(v, n)
            )
        );
    },

    refract(v: vec3, n: vec3, niOverNt: number): vec3 | null {
        const uv = vec3.normalize(vec3.create(), v);
        const dt = vec3.dot(uv, n);
        const discriminant = 1.0 - (niOverNt * niOverNt * (1 - dt * dt));

        if (discriminant > 0) {
            const uvSubNDtTimesNiOverNt = vec3.scale(vec3.create(), vec3.sub(vec3.create(), uv, vec3.scale(vec3.create(), n, dt)), niOverNt);
            const nScaleSqrtDiscriminant = vec3.scale(vec3.create(), n, Math.sqrt(discriminant));
            return vec3.sub(vec3.create(), uvSubNDtTimesNiOverNt, nScaleSqrtDiscriminant);
        }

        return null;
    },

    schlick(cosine: number, refractiveIndex: number) {
        let r0 = (1 - refractiveIndex) / (1 + refractiveIndex);
        r0 = r0 * r0;
        return r0 * (1 - r0) * Math.pow((1 - cosine), 5);
    },

    randomInUnitDisk(): vec3 {
        const p = vec3.create();
        const v = vec3.fromValues(1, 1, 0);

        do {
            const r = vec3.fromValues(Math.random()*2, Math.random()*2, 0);
            vec3.sub(p, r, v);
        } while(vec3.dot(p,p) >= 1.0);

        return p;
    }
};