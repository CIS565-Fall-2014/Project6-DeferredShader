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
  
  int blurRange = 6;
  int totalPix = blurRange * 4 + 1;
  float factor = 1.0/float(totalPix);
  //blur
  //gl_FragColor = 0.2 * texture2D( u_shadeTex, v_texcoord) + 0.2 * texture2D( u_shadeTex, v_texcoord + R)+ 0.2 * texture2D( u_shadeTex, v_texcoord - R)+ 0.2 * texture2D( u_shadeTex, v_texcoord + U)+ 0.2 * texture2D( u_shadeTex, v_texcoord - U); 
  vec4 color = factor * texture2D( u_shadeTex, v_texcoord);  
  for(float i = 1.0;i<= 6; i+=1.0)
  {
      color += factor * texture2D( u_shadeTex, v_texcoord + i * R);
      color += factor * texture2D( u_shadeTex, v_texcoord - i * R);
      color += factor * texture2D( u_shadeTex, v_texcoord + i * U);
      color += factor * texture2D( u_shadeTex, v_texcoord - i * U);
  }
// Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time

  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
   gl_FragColor = color;
}
