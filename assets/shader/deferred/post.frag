precision highp float;
#define DISPLAY_TOON 5
#define DISPLAY_BLOOM 6
#define DISPLAY_BLINN 7
#define DISPLAY_SSAO 8
#define DISPLAY_BLUR 9

#define KERNEL_SIZE 21
#define SAMPLEKERNEL_SIZE 100

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

//Added
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform float u_ScreenWidth;
uniform float u_ScreenHeight;

uniform mat4 u_projection;
uniform float u_radius;
uniform vec3 u_samplekernel[100];


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}


float gaussian2d(int x,int y,int n) {
    float sigma = 2.0;
    float fx = float(x) - (float(n) - 1.0) / 2.0;
    float fy = float(y) - (float(n) - 1.0) / 2.0;
	return (exp(-abs(fx*fy)/ (2.0*sigma*sigma)))/ (2.0 * 3.1415926 *sigma*sigma);
}

vec4 bloomShader() {
    float offsetw =  1.0 / u_ScreenWidth;
	float offseth =  1.0 / u_ScreenHeight;
	float width = (float(KERNEL_SIZE) - 1.0) / 2.0;
    vec3 c = vec3(0.0,0.0,0.0);
	
	for(int i=0; i< KERNEL_SIZE; i++){
			for(int j=0; j< KERNEL_SIZE; j++){
			    vec2 tc = v_texcoord;
				tc.y += (float(i)-width)*offseth;
				tc.x += (float(j)-width)*offsetw;
				c += gaussian2d(i,j,KERNEL_SIZE) * texture2D(u_shadeTex, tc).rgb;			
			}
		}

	return vec4(c,1.0);
}

//SSAO
float rand(float co){
    return fract(sin(dot(vec2(co,co) ,vec2(12.9898,78.233))) * 43758.5453);
}

//http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
vec4 SSAO() {
	vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
	vec3 position = texture2D(u_positionTex, v_texcoord).xyz;
	float depth = texture2D(u_depthTex, v_texcoord).r;
	depth = linearizeDepth( depth, u_zNear, u_zFar );
	float occlusion = 0.0;
	vec3 origin = vec3(position.x, position.y, depth);	
		
	for(int i = 0; i < SAMPLEKERNEL_SIZE; ++i){		
		
		vec3 rvec = normalize(u_samplekernel[i]);			
		vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
		vec3 bitangent = cross(normal, tangent);
		mat3 tbn = mat3(tangent, bitangent, normal);

		vec3 kernelv = vec3(rand(position.x),rand(position.y),(rand(position.z)+1.0) / 2.0);		  
		kernelv = normalize(kernelv);
		float scale = float(i) / float(SAMPLEKERNEL_SIZE);
		scale = mix(0.1, 1.0, scale * scale);
		kernelv = kernelv * scale ;

		vec3 sample = tbn * kernelv;										
		float sampleDepth = texture2D(u_depthTex, v_texcoord + vec2(sample.x,sample.y)* u_radius).r;
		sampleDepth = linearizeDepth( sampleDepth, u_zNear, u_zFar );
	
	    float samplez = origin.z  - (sample * u_radius).z / 2.0;

		//rangeCheck helps to prevent erroneous occlusion between large depth discontinuities:
		float rangeCheck = abs(origin.z - sampleDepth) < u_radius ? 1.0 : 0.0;

		if(sampleDepth <= samplez)
		    occlusion += 1.0 * rangeCheck;			
	}
			
	occlusion = 1.0 - (occlusion / float(SAMPLEKERNEL_SIZE));

	return vec4(vec3(occlusion,occlusion,occlusion), 1.0);
}

vec4 Blur() {
   float depth = texture2D(u_depthTex, v_texcoord).r;
   depth = 1.0 -linearizeDepth( depth, u_zNear, u_zFar );
   vec2 texelSize = vec2(1.0/u_ScreenWidth,1.0/u_ScreenHeight);
   vec3 result = vec3(0.0,0.0,0.0);

   const int uBlurSize = 10;
   int depB = int(float(uBlurSize) * depth);
   
   vec2 hlim = vec2(float(-uBlurSize) * 0.5 + 0.5);
	for (int i = 0; i < uBlurSize; ++i) {
		if(i<=depB) 
		{
			for (int j = 0; j < uBlurSize; ++j) {
				if(j<=depB)
				{
					vec2 offset = (hlim + vec2(float(i), float(j))) * texelSize;
					result += texture2D(u_shadeTex, v_texcoord + offset).rgb;
				}
			}
		}

	}

   vec4 fResult = vec4(result / float(uBlurSize * uBlurSize),1.0);
   return fResult;
}

void main()
{
   vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;

   if (u_displayType == DISPLAY_BLOOM)
      gl_FragColor = bloomShader();
   else if(u_displayType == DISPLAY_SSAO)
      gl_FragColor = SSAO();
   else if(u_displayType == DISPLAY_BLUR)
      gl_FragColor = Blur();
   else
      gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}


