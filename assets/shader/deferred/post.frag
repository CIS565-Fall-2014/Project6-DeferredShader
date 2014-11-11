precision highp float;
#define DISPLAY_TOON 5

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

//Added
uniform int u_displayType;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  if( u_displayType == DISPLAY_TOON )
  {
	    gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
  }

   //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}
