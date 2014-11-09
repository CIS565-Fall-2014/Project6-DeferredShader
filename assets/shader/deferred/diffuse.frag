precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform sampler2D u_lightPosTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
vec3 position = texture2D(u_positionTex,v_texcoord).xyz;
vec3 normal = texture2D(u_normalTex,v_texcoord).xyz;
vec3 color = texture2D(u_colorTex,v_texcoord).xyz;
float depth = texture2D(u_depthTex,v_texcoord).x;
  gl_FragColor = vec4(color, 1.0);
 // gl_FragColor = vec4(1.0,1.0,0.0,1.0);
}
