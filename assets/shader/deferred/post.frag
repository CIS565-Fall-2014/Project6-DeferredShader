precision highp float;

#define DISPLAY_AO 5
#define DISPLAY_BLUR 7
#define DISPLAY_BLOOM 8


uniform sampler2D u_shadeTex;
uniform sampler2D u_depthTex;

uniform int u_displayType;

uniform float u_zFar;
uniform float u_zNear;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec3 getsample(float i, float j)
{
    if((i * i + j * j) >= 1.0)
       return vec3(0.0,0.0,0.0);
	else
	{
	    float x = 2.0 * i * sqrt(1.0 - i * i - j * j);
		float y = 2.0 * j * sqrt(1.0 - i * i - j * j);
		float z = 1.0 - 2.0 * ( i * i + j * j);
		return vec3(x,y,z);
	}
}

float calculateAO(float nSamples, float radius, float depth)
{
   float nVisible = 0.0;

   for(float i = -1.0; i < 1.0; i += 0.2)
  {
	for(float j = -1.0; j < 1.0; j += 0.2)
	{
		vec3 randP = getsample(i,j) * radius;
		float d = texture2D( u_depthTex, v_texcoord + randP.xy).x;
		d = linearizeDepth( d, u_zNear, u_zFar );
		if( d > depth)
		  nVisible += 1.0;
	}
  }
  return (nVisible / nSamples );
}

vec3 blurColor()
{
   float w = 1.0 / 960.0;
   float h = 1.0 / 540.0;

   vec3 color = vec3(0.0);

   for(float i = -5.0; i < 5.0; ++i)
   {
      for(float j = -5.0; j < 5.0; ++j)
	  {
	      color += texture2D(u_shadeTex, v_texcoord + vec2(w*j,h*j)).rgb;
	  }
   }

   return  color / (5.0*5.0 * 4.0);
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  float nSamples = 100.0;
  float radius = 5.0 * 1.0/960.0;
  float AO = 0.0;

  float depth = texture2D( u_depthTex, v_texcoord ).x;
  depth = linearizeDepth( depth, u_zNear, u_zFar );
  vec3 color = texture2D( u_shadeTex, v_texcoord ).rgb;


  if(u_displayType == DISPLAY_AO )
  {
    AO = calculateAO(nSamples, radius, depth);
    gl_FragColor = vec4(AO,AO,AO, 1.0); 
   }
  else if(u_displayType == DISPLAY_BLUR)
     gl_FragColor = vec4(blurColor(),1.0);
  else if(u_displayType == DISPLAY_BLOOM)
     gl_FragColor = (vec4(blurColor(),1.0) * 1.5 + vec4(texture2D(u_shadeTex, v_texcoord ).rgb,1.0))/2.0;
  else
	gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
  
}
