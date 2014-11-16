precision highp float;

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_depthTex;
uniform float u_bloom;
uniform float u_sihouete;
uniform float u_ssao;
uniform float u_zFar;
uniform float u_zNear;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

//copy from http://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner
float rand(float co){
  return fract(sin(co)) * 43758.5453;
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  vec3 value = texture2D( u_shadeTex, v_texcoord).rgb;
  
  //Bloom
  if(u_bloom > 0.0){
	  for(int i = 0; i <= 10; ++i){
		for(int j = 0; j <= 10; ++j){
			vec2 coord =  v_texcoord + vec2(float(i - 5)/1024.0, float(j - 5)/1024.0);
			vec3 tmp = texture2D( u_shadeTex, coord).rgb;
			value += tmp * (6.0 - abs(5.0 - float(i)))  * (6.0 - abs(5.0 - float(j))) / 1000.0;
		}
	  }
  }
  
  //sihouete
  if(u_sihouete >0.0){
	  vec3 c11 = texture2D(u_normalTex, v_texcoord).rgb;
	  float off = 1.0 / 800.0;
	  float threadHold = 0.10;
	  
	  float  s00 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(-off,-off)).rgb)-threadHold);  
	  float  s01 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(0.0,-off)).rgb)-threadHold);  
	  float  s02 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(off,-off)).rgb)-threadHold);  
	  
	  float  s10 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(-off,0)).rgb)-threadHold);  
	  float  s12 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(off,0)).rgb)-threadHold); 
	  
	  float  s20 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(-off,off)).rgb)-threadHold);  
	  float  s21 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(0.0,off)).rgb)-threadHold);  
	  float  s22 = max(0.0,dot(c11, texture2D(u_normalTex, v_texcoord + vec2(off,off)).rgb)-threadHold); 
	  
	  float sobelX = s00 + 2.0 * s10 + s20 - s02 - 2.0 * s12 - s22;
	  float sobelY = s00 + 2.0 * s01 + s02 - s20 - 2.0 * s21 - s22;
	  float edgeSqr = (sobelX * sobelX + sobelY * sobelY);
	  
	  if(edgeSqr > 0.07 * 0.07)
		  gl_FragColor = vec4(0,0,0, 1.0); 
	   else
		  gl_FragColor = vec4(value, 1.0); 
	  }
	  else
		gl_FragColor = vec4(value, 1.0); 
		
	//SSAO
	if(u_ssao>0.0){
    float radius = 0.01;
	vec3 position = texture2D(u_positionTex,v_texcoord).rgb;
	vec3 normal = texture2D(u_normalTex, v_texcoord).rgb;
	float depth = texture2D(u_depthTex,v_texcoord).r;
	depth = linearizeDepth(depth,u_zNear,u_zFar);
	vec3 origin = vec3(position.x, position.y, depth);
	float count = 0.0;
	
	for(int i = 0; i<50; ++i){
		vec3 kernel = normalize(vec3(rand(position.x+ float(i)), rand(position.y+ float(i)), (rand(position.z + float(i))+1.0)/2.0))*0.2;
		vec3 rvec = normalize(vec3(0.0, rand(position.y + float(i)), rand(position.z+ float(i))));
		vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
		vec3 bitangent = cross(normal, tangent);
		mat3 tbn = mat3(tangent, bitangent, normal);
		vec3 sampleVector = tbn * kernel;		
		float sampleDepth = texture2D(u_depthTex, v_texcoord + (sampleVector * radius).xy ).r;
		sampleDepth = linearizeDepth( sampleDepth, u_zNear, u_zFar );
		vec3 samplePoint = origin + vec3((sampleVector * radius).x, (sampleVector * radius).y, -(sampleVector * radius).z / 2.0);
		
		if(sampleDepth <= samplePoint.z)
			count+= 1.0;
	}
	gl_FragColor = vec4(value* (1.0-count/50.0), 1.0); // vec4(1.0 - count/50.0, 1.0 - count/50.0, 1.0 - count/50.0, 1.0);
	}

}
