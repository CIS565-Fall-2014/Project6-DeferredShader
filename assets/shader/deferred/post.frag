precision highp float;

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

#define WIDTH 960.0
#define HEIGHT 540.0

#define BLOOM_THRESHOLD 0.9
// Despite being called radius, these values actually sample in squares.
#define BLOOM_RADIUS 10.0

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
  
  vec2 dx = vec2(1.0/WIDTH, 0);
  vec2 dy = vec2(0, 1.0/HEIGHT);
  //-------------------------
  // Bloom
  // Note that bloom also appears to require a rng for blur
  vec3 bloomCol;
  float totalT = 0.0;
  
  for (float i = -BLOOM_RADIUS; i <= BLOOM_RADIUS + 0.1; i++) {
    for (float j = -BLOOM_RADIUS; j <= BLOOM_RADIUS + 0.1; j++) {
      //Bloom with pow(2) falloff.
      float t = pow(BLOOM_RADIUS + 1.0 - abs(i), 2.0) + pow(BLOOM_RADIUS + 1.0 - abs(j), 2.0);
      bloomCol += clamp(texture2D( u_shadeTex, v_texcoord + i * dx + j * dy).rgb - vec3(BLOOM_THRESHOLD), 0.0, 1.0) / (1.0 - BLOOM_THRESHOLD) * t;
      totalT += t;
    }
  }
  bloomCol /= totalT;
  
  gl_FragColor = vec4(shade + bloomCol, 1.0);
  //gl_FragColor = vec4(shade, 1.0);
  //gl_FragColor = vec4(bloomCol, 1.0);
}
