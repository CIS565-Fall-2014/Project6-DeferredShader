precision highp float;

#define LAYOUTTEST 0
#define BLOOM 1

uniform sampler2D u_shadeTex;
uniform vec2 u_resolution;
uniform int u_effect;

varying vec2 v_texcoord;

const float bloom_fac = 0.1;
const float bloom_rad = 7.0;


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

bool flagged(int v, int f) {
    for (int i = 0; i < 4; ++i) {
        if (i == f && (v / 2) * 2 != v) {
            return true;
        }
        v /= 2;
    }
    return false;
}

void main()
{
    vec3 c = texture2D(u_shadeTex, v_texcoord).rgb;

#if LAYOUTTEST

    vec3 sum = c + vec3(u_resolution + v_texcoord, 0.0) * float(u_effect);

#else // LAYOUTTEST

#if BLOOM
    vec3 sum = c;
    if (flagged(u_effect, 1)) {
        // Bloom
        float radsq = bloom_rad * bloom_rad;
        if (bloom_rad > 0.0) {
            for (float x = -bloom_rad; x <= bloom_rad; ++x) {
                for (float y = -bloom_rad; y <= bloom_rad; ++y) {
                    float inten = 1.0 - (x * x + y * y) / radsq;
                    if (inten > 0.0 && x != 0.0 && y != 0.0) {
                        vec2 tc = v_texcoord + vec2(x, y) / u_resolution;
                        sum += inten * clamp(texture2D(u_shadeTex, tc).rgb - vec3(0.5), 0.0, 1.0) * bloom_fac;
                    }
                }
            }
        }
    }
#endif

#endif // LAYOUTTEST

    gl_FragColor = vec4(sum, 1.0);
}
