precision highp float;

#define DISPLAY_BLOOM 5

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;

varying vec2 v_texcoord;

uniform int u_displayType;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  
    if( u_displayType == DISPLAY_BLOOM )
	  {
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 color = vec3(0,0,0);
		if (normal.b > 0.2)
			color += texture2D( u_shadeTex, v_texcoord).rgb;
		color /= 9.0;
		gl_FragColor = vec4(0,1,0,1);//vec4(color, 1.0); 
	  }
	else
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
	
	gl_FragColor = gl_FragColor;
}