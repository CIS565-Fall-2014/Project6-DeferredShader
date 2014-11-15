precision highp float;
#define DISPLAY_DIFFUSE 5
#define DISPLAY_TOON 6
#define DISPLAY_BLOOM 7
#define DISPLAY_SSAO 8
uniform sampler2D u_shadeTex;

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
    if (u_displayType==DISPLAY_DIFFUSE||u_displayType==DISPLAY_TOON) {
        gl_FragColor = vec4(texture2D(u_shadeTex, v_texcoord).rgb, 1.0);
    }
    else if(u_displayType==DISPLAY_BLOOM)
    {
        
    }
    gl_FragColor = vec4(texture2D(u_shadeTex, v_texcoord).rgb, 1.0);

    
    
  
}
