precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform vec3 u_lamppos;

varying vec2 v_texcoord;

const vec3 lampcol = vec3(0.8, 0.9, 1.0);
const float specexp = 50.0;
const float ambfact = 0.1;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    vec3  p = texture2D(u_positionTex, v_texcoord).rgb;
    vec3  n = texture2D(u_normalTex  , v_texcoord).rgb;
    vec3  c = texture2D(u_colorTex   , v_texcoord).rgb;
    float d = texture2D(u_depthTex   , v_texcoord).r;

    vec3 lampdir = normalize(u_lamppos - p);

    float difffact = max(0.0, dot(lampdir, n));

    float specfact = pow(max(0.0, dot(n, lampdir)), specexp);

    vec3 color = (ambfact + difffact + specfact) * lampcol * c;
    gl_FragColor = vec4(color, 1);
}
