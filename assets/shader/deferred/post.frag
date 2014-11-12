precision highp float;

uniform sampler2D u_shadeTex;
/////////////////////////////
uniform sampler2D u_depthTex;
uniform sampler2D u_extraTex;
////////////////////////////
//new
//put gaussian here
uniform float u_gaussKernel[25];
uniform vec2 u_textureSize;

varying vec2 v_texcoord;

const float thresh = 0.95;
const float depthThresh = .001;
const int gaussSize = 5;
const float SIGMA = 2.0;
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
  /////////////////////////////////////////////////////////////////////
  ///////////////// Ambient Occlustion ////////////////////////////////
  
  float gaussWeight;
  float gaussTot = 0.0;
  float localAO = float(texture2D( u_extraTex, coord).r);
  float AO = 0.0;
  float totAO = 0.0;
  float depth = texture2D( u_depthTex, v_texcoord ).x;
  float sampleDepth;
  for(  int x = - gaussSize; x <= gaussSize; x++){
    for(int y = - gaussSize; y <= gaussSize; y++){
      coord = v_texcoord + onePixel * vec2(x,y);
      gaussWeight = gaussianWeight(float(x), float(y), SIGMA);
      AO = float(texture2D( u_extraTex, coord).r);
      sampleDepth = texture2D( u_depthTex, coord ).x;
      gaussTot += gaussWeight;
      if(abs(sampleDepth - depth) > depthThresh){
        totAO += AO;
      }else{
        totAO += localAO;
      }
    }
  }
  totAO *= 1.0/gaussTot;
  
  
  /////////////////////////////////////////////////////////////////////
  /////////////  GLOW ///////////////////////////////////////////
  float intensity;
  color = vec3(0,0,0);
  gaussTot = 0.0;
  for(  int x = - gaussSize; x <= gaussSize; x++){
    for(int y = - gaussSize; y <= gaussSize; y++){
      coord = v_texcoord + onePixel * vec2(x,y);
      bloom = texture2D( u_shadeTex, coord).rgb;
      intensity = max(bloom.x, max(bloom.y, bloom.z));
      gaussWeight = gaussianWeight(float(x), float(y), SIGMA);
      gaussTot += gaussWeight;
      if(intensity > thresh){
        color += bloom * gaussWeight;
      }
    }
  }
  color *= 1.0/gaussTot;
  
  vec3 currentColor = texture2D( u_shadeTex, v_texcoord).rgb;
  //currentColor *= localAO;
  intensity = max(currentColor.x, max(currentColor.y, currentColor.z));
  if(intensity < thresh){
    currentColor += color;
  }
 //////////////////////////////////////////////////////////////////////

 
 
  color = texture2D( u_shadeTex, v_texcoord).rgb;
  //color = vec3(totAO);
  gl_FragColor = vec4(color, 1.0); 
  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}
