precision highp float;

uniform sampler2D u_shadeTex;
/////////////////////////////
uniform sampler2D u_extraTex;
////////////////////////////
//new
//put gaussian here
uniform float u_gaussKernel[25];
uniform vec2 u_textureSize;

varying vec2 v_texcoord;

const float thresh = 0.95;
const int gaussSize = 10;
const float sigma = 7.0;
const float PI = 3.1415926;
const float E = 2.718281828459045;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float gaussianWeight(float x, float y, float sigma){
  float xSquared = x * y;
  float ySquared = y * y;
  float sigmaSquared = sigma * sigma;
  float exponent = (xSquared + ySquared)/sigmaSquared;
  float e = pow(E,-exponent);
  return e / (2.0 * PI * sigmaSquared);
}

void main()
{
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  vec2 coord = v_texcoord;
  
  vec3 color = vec3(0,0,0);//texture2D( u_shadeTex, v_texcoord).rgb;
  vec3 bloom = vec3(0,0,0);
  
  float intensity;
  float gaussWeight;
  float gaussTot = 0.0;
  for(  int x = - gaussSize; x <= gaussSize; x++){
    for(int y = - gaussSize; y <= gaussSize; y++){
      coord = v_texcoord + onePixel * vec2(x,y);
      bloom = texture2D( u_shadeTex, coord).rgb;
      intensity = max(bloom.x, max(bloom.y, bloom.z));
      gaussWeight = gaussianWeight(float(x), float(y), sigma);
      //gaussTot += gaussWeight;
      if(intensity > thresh){
        color += bloom * gaussWeight;
      }
    }
  }
  //color *= 1.0/gaussTot;
  
  vec3 currentColor = texture2D( u_shadeTex, v_texcoord).rgb;
  intensity = max(currentColor.x, max(currentColor.y, currentColor.z));
  //if(intensity < thresh){
    currentColor += color;
  //}
 
  color = texture2D( u_shadeTex, v_texcoord).rgb;
  gl_FragColor = vec4(currentColor, 1.0); 
  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}
