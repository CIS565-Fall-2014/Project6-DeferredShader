precision highp float;

#define DISPLAY_POS 1
#define DISPLAY_NORMAL 2
#define DISPLAY_COLOR 3
#define DISPLAY_DEPTH 4

uniform sampler2D u_positionTex;
uniform sampler2D u_colorTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

void main()
{
  vec4 position4 = texture2D( u_positionTex, v_texcoord );
  vec4 color4 = texture2D( u_colorTex, v_texcoord );
  // Reconstruct the normal.
  // Note that the normal should always be pointing towards the camera.
	vec3 normal = vec3(position4.w, color4.w, sqrt(1.0 - position4.w * position4.w - color4.w * color4.w));
  vec3 position = position4.xyz;
	vec4 color = vec4(color4.rgb, 1.0);
  float depth = -1.0;
  if (position.z < 0.0) {
    depth = position.z / u_zFar;
  }

  if( u_displayType == DISPLAY_DEPTH )
	    gl_FragColor = vec4( depth, depth, depth, 1 );
	else if( u_displayType == DISPLAY_COLOR )
	    gl_FragColor = color;
	else if( u_displayType == DISPLAY_NORMAL )
	    gl_FragColor = vec4( normal, 1 );
	else
	    gl_FragColor = vec4( position, 1 );
}
