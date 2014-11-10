precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

const vec3 matcol = vec3(1, 1, 1);
const vec3 lamppos = vec3(2, 2, 2);
const vec3 lampcol = vec3(30, 35, 40);

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    vec3  p = texture2D(u_positionTex, v_texcoord).rgb;
    vec3  n = texture2D(u_normalTex  , v_texcoord).rgb;
    vec3  c = texture2D(u_colorTex   , v_texcoord).rgb;
    float d = texture2D(u_depthTex   , v_texcoord).r;

    float lampdist = length(lamppos - p);
    float lampinten = pow(lampdist, -2.0);
    vec3 lampdir = (lamppos - p) / lampdist;
    float difffact = dot(lampdir, n) * lampinten;

    float specfact = 0.0;

    vec3 color = (difffact + specfact) * lampcol * matcol;
    gl_FragColor = vec4(color, 1);
}
