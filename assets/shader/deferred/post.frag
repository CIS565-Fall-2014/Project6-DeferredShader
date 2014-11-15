precision highp float;

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  vec3 value = texture2D( u_shadeTex, v_texcoord).rgb;
  
  //Bloom
  if(false){
	  for(int i = 0; i <= 10; ++i){
		for(int j = 0; j <= 10; ++j){
			vec2 coord =  v_texcoord + vec2(float(i - 5)/1024.0, float(j - 5)/1024.0);
			vec3 tmp = texture2D( u_shadeTex, coord).rgb;
			value += tmp * (6.0 - abs(5.0 - float(i)))  * (6.0 - abs(5.0 - float(j))) / 1000.0;
		}
	  }
  }
  
  //sihouete
  vec3 c11 = texture2D(normalTex, v_texcoord).rgb;
  
  gl_FragColor = vec4(value, 1.0); 
}
