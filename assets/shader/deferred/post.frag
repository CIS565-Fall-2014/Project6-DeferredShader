precision highp float;

#define DISPLAY_BLOOM 5
#define DISPLAY_BLOOM2 6
#define DISPLAY_TOON 7
#define DISPLAY_AMBIENT_OCCU 8
#define DISPLAY_AMBIENT 9

#define KernelSize 64
#define NoiseSize 16
#define Radius 3.0
#define BlurSize 2

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_depthTex;

uniform mat4 u_mvp;

uniform float u_zFar;
uniform float u_zNear;

varying vec2 v_texcoord;

uniform int u_displayType;

uniform int u_width;
uniform int u_height;

uniform vec3 u_lightCol;
uniform vec3 u_lightPos;
uniform vec3 u_eyePos;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float edgeDetect(vec2 texcoord)
{
	vec2 G = vec2(0,0);
	vec3 Gx = vec3(0,0,0);
	vec3 Gy = vec3(0,0,0);
	for (int i = -1; i <= 1; i++)
	{
		for (int j = -1; j <= 1; j++)
		{
			vec3 c = texture2D(u_shadeTex, texcoord + vec2( float(i)/float(u_width), float(j)/float(u_height))).rgb;
			Gx += float((i == 0) ? j + j : j) * c;
			Gy += float((j == 0) ? -i - i : -i) * c;
		}
	}
	return sqrt(dot(Gx, Gx) + dot(Gy, Gy));
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  
	vec3 color;
	
	if( u_displayType == DISPLAY_BLOOM )
	{
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		color = vec3(0,0,0);
		float weight = 0.0;
		for (int i = -5; i<= 5; i++)
		{
			for (int j = -5; j <= 5; j++)	
			{
				vec2 texcoord = v_texcoord + vec2(float(i) / float(u_width), float(j) / float(u_height));
				float g = edgeDetect(texcoord);
				if (g > 0.9)
				{
					weight += 1.0 - length(vec2(i,j)) / length(vec2(5,5));
				}
			}
		}
		gl_FragColor = vec4(0.8*texture2D( u_shadeTex, v_texcoord).rgb+float(weight)/50.0*vec3(1.0, 1.0, 0.0), 1.0); 
	}
	else if (u_displayType == DISPLAY_BLOOM2)
	{
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); 
	}
	else if (u_displayType == DISPLAY_TOON)
	{
		color = texture2D( u_shadeTex, v_texcoord).rgb;
		
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 lightDir = normalize(texture2D(u_positionTex, v_texcoord).rgb - u_lightPos);
		float intensity = dot(-lightDir, normal);
	 
		// Discretize color
		if (intensity > 0.95)
			color = vec3(1,1,1) * color;
		else if (intensity > 0.5)
			color = vec3(0.9,0.9,0.9) * color;
		else if (intensity > 0.05)
			color = vec3(0.35,0.35,0.35) * color;
		else
			color = vec3(0.2,0.2,0.2) * color;
		
		//silhouetting, sobel detect
		float line = 0.3 * edgeDetect(v_texcoord);
		
		gl_FragColor = vec4(color-line, 1.0); 
		
	}
	else if (u_displayType == DISPLAY_AMBIENT_OCCU)
	{
		//generate samples
		vec3 kernel[KernelSize];
		for (int i = 0; i < KernelSize; ++i) {
		   kernel[i] = normalize(vec3(rand(vec2(-1.0, 1.0)), rand(vec2(-1.0, 1.0)), rand(vec2(0.0, 1.0)) ));
		   
		   float scale = float(i) / float(KernelSize);
		   scale = mix(0.1, 1.0, scale * scale);
		   kernel[i] *= scale;
		}
		
		//noise
		//vec3 noise[NoiseSize];
		//for (int i = 0; i < NoiseSize; ++i) {
		//   noise[i] = normalize(vec3(rand(vec2(-1.0, 1.0)), rand(vec2(-1.0, 1.0)), 0.0));
		//}
		
		//occlusion factor
		vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
		float depth = texture2D(u_depthTex, v_texcoord).r;
		float linearDepth = linearizeDepth(depth, u_zNear, u_zFar);
		pos.z = linearDepth;
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		
		vec2 noiseTex = v_texcoord * vec2(float(u_width)/4.0, float(u_height)/4.0);
		vec3 noise;
		for (int i = 0; i < NoiseSize; i++)
		{
			if (i == int(noiseTex.x * 4.0 + noiseTex.y))
				noise = normalize(vec3(rand(vec2(-1.0, 1.0)), rand(vec2(-1.0, 1.0)), 0.0));
		}
		
		vec3 randvec = noise * 2.0 - 1.0;
		vec3 tangent = normalize(randvec - normal * dot(randvec, normal));
		vec3 bitangent = cross(normal, tangent);
		mat3 tbn = mat3(tangent, bitangent, normal);
		
		float occlusion = 0.0;
		for (int i = 0; i < KernelSize; i++)
		{
			vec3 sample = tbn * kernel[i];
			sample = sample * Radius + pos;
			
			vec4 offset = vec4(sample, 1);
			offset = u_mvp * offset;
			offset.xy /= offset.w;
			offset.xy = offset.xy * 0.5 + 0.5;
			
			float sampleDep = texture2D(u_depthTex, offset.xy).r;
			
			float inside = abs(pos.z - sampleDep) < Radius ? 1.0 : 0.0;
			occlusion += (sampleDep <= sample.z ? 1.0 : 0.0) * inside;  //front has smaller z
		}
		
		occlusion = 1.0 - (occlusion / float(KernelSize));
		
		/*
		//blur
		vec2 texelSize = 1.0 / vec2(textureSize(uInputTex, 0));
		float result = 0.0;
		vec2 hlim = vec2(float(-BlurSize) * 0.5 + 0.5);
		for (int i = 0; i < BlurSize; ++i) {
			for (int j = 0; j < BlurSize; ++j) {
				vec2 offset = (hlim + vec2(float(x), float(y))) * texelSize;
				result += texture(uTexInput, vTexcoord + offset).r;
			}
		}
		fResult = result / float(uBlurSize * uBlurSize);
		*/
		
		color = texture2D( u_shadeTex, v_texcoord).rgb;
		color =vec3 (1,1,1);
		gl_FragColor = vec4(color * occlusion, 1.0); 
		
	}
	else if (u_displayType == DISPLAY_AMBIENT)
	{
		gl_FragColor = vec4(0,0,1, 1.0); 
	}
	else
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}