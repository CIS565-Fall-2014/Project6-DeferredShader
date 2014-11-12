precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform vec3 u_lamppos;
uniform int u_effect;

varying vec2 v_texcoord;

const vec3 lampcol = vec3(0.8, 0.9, 1.0);
const float specexp = 50.0;
const float _ambfact = 0.1;
const vec3 u_bgcolor = vec3(0.2, 0.2, 0.2);

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    float d = texture2D(u_depthTex   , v_texcoord).r;

    if (d > 0.999) {
        gl_FragColor = vec4(u_bgcolor, 1);
        return;
    }

    float ambfact = _ambfact;
    vec3  p = texture2D(u_positionTex, v_texcoord).rgb;
    vec3  n = texture2D(u_normalTex  , v_texcoord).rgb;
    vec3  c = texture2D(u_colorTex   , v_texcoord).rgb;

    vec3 lampdir = normalize(u_lamppos - p);

    float difffact = max(0.0, dot(lampdir, n));

    float specfact = pow(max(0.0, dot(n, lampdir)), specexp);

    if (u_effect == 2) {
        // Toon shading
        difffact = mix(0.0, 0.2, clamp((difffact - 0.1) * 50.0, 0.0, 1.0))
                 + mix(0.0, 0.5, clamp((difffact - 0.6) * 50.0, 0.0, 1.0));
        specfact = mix(0.0, 1.0, clamp((specfact - 0.1) * 10.0, 0.0, 1.0));
    }

    vec3 color = (ambfact + difffact + specfact) * lampcol * c;

    if (u_effect == 2) {
        if (n.z < 0.6) {
            color = vec3(0.0);
        }
    }

    gl_FragColor = vec4(color, 1);
}
