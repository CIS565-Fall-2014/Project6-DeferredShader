precision highp float;

#define DISPLAY_POS 1
#define DISPLAY_NORMAL 2
#define DISPLAY_COLOR 3
#define DISPLAY_DEPTH 4

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
	vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
	vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
	vec4 color = texture2D( u_colorTex, v_texcoord );
	//vec4 color = vec4(1.0,1.0,0.0,1.0);
	float depth = texture2D( u_depthTex, v_texcoord ).x;

	depth = linearizeDepth( depth, u_zNear, u_zFar );

    if( u_displayType == DISPLAY_DEPTH )
	    gl_FragColor = vec4( depth, depth, depth, 1 );
	else if( u_displayType == DISPLAY_COLOR )
	    gl_FragColor = color;
	else if( u_displayType == DISPLAY_NORMAL )
	    gl_FragColor = vec4( normal, 1 );
	else
	    gl_FragColor = vec4( position, 1 );
}
