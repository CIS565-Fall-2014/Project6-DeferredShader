precision highp float;

uniform sampler2D u_shadeTex;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_depthTex;

varying vec2 v_texcoord;

#define WIDTH 960.0
#define HEIGHT 540.0

#define BLOOM_THRESHOLD 0.9
// Despite being called radius, these values actually sample in squares.
#define BLOOM_RADIUS 6.0
#define OUTLINE_RADIUS 3.0
#define AO_RADIUS 20.0

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

// Found this rand function online.
float rand(float x, float y){
  return fract(sin(x * 12.9898 + y * 78.233)) * 43758.5453;
}

void main()
{
  // Currently acts as a pass filter that immediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
  
  vec2 dx = vec2(1.0/WIDTH, 0);
  vec2 dy = vec2(0, 1.0/HEIGHT);
  
  //-----------------------
  // Ambient Occlusion
  float AO = 0.0;
  float numAOSamples = 10.0;
  vec3 norm = texture2D(u_normalTex, v_texcoord).rgb;
  vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
  float depth = texture2D(u_depthTex, v_texcoord).r;  

  float totalT = 0.0;
  
  for (float i = -AO_RADIUS; i <= AO_RADIUS + 0.1; i++) {
    for (float j = -AO_RADIUS; j <= AO_RADIUS + 0.1; j++) {
      if (texture2D(u_positionTex, v_texcoord + i * dx + j * dy).z > pos.z){//} + 1.0 - norm.z) {
        AO += 1.0;
      }
    }
  }
  AO /= pow(2.0 * AO_RADIUS + 1.0, 2.0);
  // blend AO with u_shadeTex.
  
  
  //-------------------------
  // Outlines
  float outline = 1.0;
  for (float i = -OUTLINE_RADIUS; i <= OUTLINE_RADIUS + 0.1; i++) {
    for (float j = -OUTLINE_RADIUS; j <= OUTLINE_RADIUS + 0.1; j++) {
      if ( pos.z - texture2D(u_positionTex, v_texcoord + i * dx + j * dy).z >= 0.2){//2.0 * (texture2D(u_normalTex, v_texcoord + i * dx + j * dy).z - norm.z) * length(texture2D(u_positionTex, v_texcoord + i * dx + j * dy).rgb - pos)) {
          outline = 0.0;
      }
    }
  }
  
  //-------------------------
  // Bloom
  // Note that bloom also appears to require a rng for blur
  vec3 bloomCol;
  totalT = 0.0;
  
  for (float i = -BLOOM_RADIUS; i <= BLOOM_RADIUS + 0.1; i++) {
    for (float j = -BLOOM_RADIUS; j <= BLOOM_RADIUS + 0.1; j++) {
      //Bloom with pow(2) falloff.
      float t = pow(BLOOM_RADIUS + 1.0 - abs(i), 2.0) + pow(BLOOM_RADIUS + 1.0 - abs(j), 2.0);
      bloomCol += clamp(texture2D( u_shadeTex, v_texcoord + i * dx + j * dy).rgb - vec3(BLOOM_THRESHOLD), 0.0, 1.0) / (1.0 - BLOOM_THRESHOLD) * t;
      totalT += t;
    }
  }
  bloomCol /= totalT;
  
  //gl_FragColor = vec4(vec3(1.0 - AO), 1.0);
  gl_FragColor = vec4(shade * outline * AO + bloomCol, 1.0); 
  //gl_FragColor = vec4(vec3(1.0) - (vec3(1.0) - shade * outline) * (vec3(1.0) - bloomCol), 1.0); 
  //gl_FragColor = vec4(bloomCol, 1.0);
  //gl_FragColor = vec4(vec3(outline), 1.0);
  //gl_FragColor = vec4(vec3(1.0 - AO), 1.0);
}
