precision highp float;

#define LAYOUTTEST 0
#define DIFFSPEC 1
#define TOON 1
#define SSAO 1

uniform sampler2D u_depthTex;    // d
uniform sampler2D u_positionTex; // px py pz
uniform sampler2D u_colorTex;    // r g b
//uniform sampler2D u_normalTex;   // nx ny (nz)

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform vec3 u_lamppos;
uniform int u_effect;

varying vec2 v_texcoord;

const vec3 lampcol = vec3(0.8, 0.9, 1.0);
const float specexp = 50.0;
const float ambfact = 0.1;
const vec3 u_bgcolor = vec3(0.2, 0.2, 0.2);

const float SSAO_RAD = 10.0;
const float SSAO_SAMPLES = 100.0;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
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
    float d = texture2D(u_depthTex   , v_texcoord).r;
    vec4 tp = texture2D(u_positionTex, v_texcoord);
    vec4 tc = texture2D(u_colorTex   , v_texcoord);
    //vec4 tn = texture2D(u_normalTex  , v_texcoord);
    vec3  p = tp.xyz;
    vec3  c = tc.rgb;
    float nx = tp.w, ny = tc.w;
    vec3  n = vec3(nx, ny, sqrt(1.0 - nx * nx - ny * ny));

#if LAYOUTTEST

    // This layout performance test uses all of the uniforms and varyings
    vec3 color = linearizeDepth(d, u_zNear, u_zFar)
        * float(u_effect) * float(u_displayType)
        * (n + p + c + u_lamppos + vec3(v_texcoord, 0.0));

#else // LAYOUTTEST

    if (d > 0.999) {
        gl_FragColor = vec4(u_bgcolor, 1);
        return;
    }

    // SSAO
    float aofact = 1.0;
#if SSAO
    if (!flagged(u_effect, 3)) {
        aofact = 0.0;
        vec3 tang = cross(vec3(0, 1, 0), n);
        vec3 bitang = cross(n, tang);
        for (float i = 0.0; i < SSAO_SAMPLES; ++i) {
            vec3 hemi = normalize(vec3(
                rand(p.xy * vec2(i, 2)) * 2.0 - 1.0,
                rand(p.xy * vec2(i, 3)) * 2.0 - 1.0,
                rand(p.xy * vec2(i, 5))
                )) * SSAO_RAD;
            float scale = i / SSAO_SAMPLES;
            hemi *= mix(0.1, 1.0, scale * scale);
            vec3 samppos = mat3(tang, bitang, n) * hemi;
            vec2 sampcoord = v_texcoord + samppos.xy;
            if (samppos.z < texture2D(u_depthTex, sampcoord).r) {
                aofact += 1.0;
            }
        }
        aofact /= SSAO_SAMPLES;
        aofact = 1.0 - aofact;
    }
#endif

    float difffact = 1.0;
    float specfact = 0.0;
#if DIFFSPEC
    if (!flagged(u_effect, 0)) {
        // Diffuse/specular
        vec3 lampdir = normalize(u_lamppos - p);
        difffact = max(0.0, dot(lampdir, n));
        specfact = pow(max(0.0, dot(n, lampdir)), specexp);
    }
#endif

#if TOON
    if (flagged(u_effect, 2)) {
        // Toon shading
        difffact = mix(0.0, 0.2, clamp((difffact - 0.1) * 50.0, 0.0, 1.0))
                 + mix(0.0, 0.5, clamp((difffact - 0.6) * 50.0, 0.0, 1.0));
        specfact = mix(0.0, 1.0, clamp((specfact - 0.1) * 10.0, 0.0, 1.0));
    }
#endif

    vec3 color = (aofact * (ambfact + difffact + specfact)) * lampcol * c;

#if TOON
    if (flagged(u_effect, 2)) {
        // Toon shading outline
        if (n.z < 0.6) {
            color = vec3(0.0);
        }
    }
#endif

#endif // LAYOUTTEST

    gl_FragColor = vec4(color, 1);
}
