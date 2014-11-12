precision highp float;

#define DOF false
#define BLUR false
#define SIGMA 3.0
#define WIDTH 960
#define HEIGHT 540
#define PI 3.1415926
#define BLUR_NUM 10.0
#define FOCUS 0.5
#define FOCUS_RANGE 0.05

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec4 GaussianBlur(float sigma, vec2 R, vec2 U, float radius)
{
    vec4 color = vec4(0.0);
	float S = 2.0 * sigma * sigma;
	float sum = 0.0;
    for(float i = -BLUR_NUM;i<= BLUR_NUM; i+=1.0)
    {
	    for(float j = - BLUR_NUM; j<= BLUR_NUM; j+=1.0)
		{
		    vec2 dir = i * R + j * U;
			vec2 pos = v_texcoord + dir;
			if(length(dir) > radius) continue;
		    float factor = 1.0/(S* PI) * exp(-(i*i + j*j)/S);
		    color += factor * texture2D( u_shadeTex, pos);
			sum += factor;
		}
    }
	color /= sum;
	return color;
}
void main()
{
  float pixH = 1.0/float(WIDTH);
  float pixW = 1.0/float(HEIGHT);

  vec2 R = vec2(pixW,0.0);
  vec2 U = vec2(0.0,pixH );
  float radius = BLUR_NUM *  pixH;
  
  vec4 color = texture2D( u_shadeTex, v_texcoord);

  //depth of field
  float depth = color.a;
  //float focus = FOCUS;
  //float absDepth = abs(focus - depth);
  //depth = pow(step(FOCUS_RANGE,absDepth) * absDepth, 4.0);

  //Gausian Blur stuff
  if(DOF && depth > 0.01)
  {
	 color =  GaussianBlur(SIGMA  * depth,  R,  U,radius);
  }

  if(BLUR) color =  GaussianBlur(SIGMA ,  R,  U,radius);

   gl_FragColor = vec4(vec3(color.rgb),1.0);
//gl_FragColor = vec4(vec3(depth),1.0);
}
