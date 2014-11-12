precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;


/////////////////////////////
uniform sampler2D u_extraTex;
////////////////////////////

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
//
uniform vec2 u_textureSize;

varying vec2 v_texcoord;

//light
const vec3 lightPos = vec3(-2.0, 3.0, 1.0);
//Specular Exponent
const float specExp = 6.0;
const int   LOOPS = 16;
uniform float u_randomNoise[64];

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float ambientOcclusion( float myDepth, vec2 sampleCoord, float multiplier, float distance ){
  //Simple AO based on Height difference
  float sampleDepth = texture2D( u_depthTex, sampleCoord ).x;
  sampleDepth       = linearizeDepth(sampleDepth, u_zNear, u_zFar);
  float ambOcc = min(1.0, max( sampleDepth - myDepth, 0.0 ) * multiplier / (distance * distance));
  return ambOcc; 
  
}

vec2 rotatePoint(vec2 position, float theta){
  float cs = cos(theta);
  float sn = sin(theta);
  vec2 newPos;
  newPos.x = position.x * cs - position.y * sn;
  newPos.y = position.x * sn + position.y * cs;
  return newPos;
}

void main()
{
  //vec3 position  = texture2D(u_positionTex, v_texcoord).rgb;
  //vec3 normal    = texture2D(u_normalTex,   v_texcoord).rgb;
  vec3 color     = texture2D(u_colorTex, v_texcoord).rgb;
  //vec3 lightDir  = normalize(lightPos - position);
  //float diffuse  = max(dot(lightDir, normal), 0.0);
  //vec3  diffCol  = diffuse * color;
  
  //vec3 reflect    = reflect(-lightDir, normal); 
  //float specAngle = max(dot(reflect, normalize(- position)), 0.0);
  //float specular  = pow(specAngle, specExp);
  //specular        = specular * diffuse;
  //vec3  specCol   = specular * color;
  
  //begin screen space ambient occlusion
  float depth = texture2D( u_depthTex, v_texcoord ).x;
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  depth = linearizeDepth( depth, u_zNear, u_zFar);
  color = vec3(depth,depth,depth);
  

  
  vec2 left  = vec2(-1, 0);
  vec2 right = vec2(1 , 0);
  vec2 up    = vec2(0, 1);
  vec2 down  = vec2(0, -1);
  //left  = rotatePoint(left, float(v_texcoord.x * v_texcoord.y));
  //right = rotatePoint(left, float(v_texcoord.x * v_texcoord.y));
  //up    = rotatePoint(left, float(v_texcoord.x * v_texcoord.y));
  //down  = rotatePoint(left, float(v_texcoord.x * v_texcoord.y));
/*
  float rand = 1.0;
  float y = 1.0 - (rand * rand);
  vec2 left  = normalize(vec2(-rand, y));
  vec2 right = normalize(vec2(rand , y));
  vec2 up    = normalize(vec2(y, rand));
  vec2 down  = normalize(vec2(y, -rand));
  */
  
  float distance = 1.0;
  vec2 sampleCoord;
  float aoMultiplier = 5000.0;
  float accumulatedAO = 0.0;
  for( int i = 1; i <= LOOPS; i ++){
    sampleCoord = v_texcoord + left  * onePixel * distance;
    accumulatedAO += ambientOcclusion( depth, sampleCoord, aoMultiplier, distance);
    sampleCoord = v_texcoord + right * onePixel * distance;
    accumulatedAO += ambientOcclusion( depth, sampleCoord, aoMultiplier, distance);
    sampleCoord = v_texcoord + up    * onePixel * distance;
    accumulatedAO += ambientOcclusion( depth, sampleCoord, aoMultiplier, distance);
    sampleCoord = v_texcoord + down  * onePixel * distance;
    accumulatedAO += ambientOcclusion( depth, sampleCoord, aoMultiplier, distance);
    //update distance
    distance += float(i + 1);
    /*
    left  = rotatePoint(left, float((v_texcoord.x + float(i)) * v_texcoord.y));
    right = rotatePoint(left, float((v_texcoord.x + float(i)) * v_texcoord.y));
    up    = rotatePoint(left, float((v_texcoord.x + float(i)) * v_texcoord.y));
    down  = rotatePoint(left, float((v_texcoord.x + float(i)) * v_texcoord.y));
    */
  }
  accumulatedAO = accumulatedAO / (4.0 * float(LOOPS));
  
  
  gl_FragColor = vec4(1.0 - accumulatedAO);
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  //gl_FragColor = vec4(diffCol + specular , 1.0);
  //gl_FragColor = vec4((1.0 - accumulatedAO) * (diffCol + specular) , 1.0);
}
