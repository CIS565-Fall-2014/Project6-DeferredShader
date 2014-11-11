precision highp float;

#define WIDTH 960
#define HEIGHT 540

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  float pixH = 1.0/float(WIDTH);
  float pixW = 1.0/float(HEIGHT);

  vec2 R = vec2(pixW,0.0);
  vec2 U = vec2(0.0,pixH );
  
  vec4 color = texture2D( u_shadeTex, v_texcoord);

  //blur stuff
  if(false)
  {
    int blurRange = 6;
    int totalPix = blurRange * 4 + 1;
    float factor = 1.0/float(totalPix);
   
    color *=factor;  
    for(float i = 1.0;i<= float(blurRange); i+=1.0)
    {
        color += factor * texture2D( u_shadeTex, v_texcoord + i * R);
        color += factor * texture2D( u_shadeTex, v_texcoord - i * R);
        color += factor * texture2D( u_shadeTex, v_texcoord + i * U);
        color += factor * texture2D( u_shadeTex, v_texcoord - i * U);
    }
  }

  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
   gl_FragColor = color;
}
