precision highp float;
#define SAMPLE_SIZE 50

uniform sampler2D u_shadeTex;
uniform vec3 u_sampleKernels[50];
uniform float u_blurRadius;
uniform mat4 u_projection;
uniform int u_SSAOToggle;
uniform int u_BloomToggle;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform float u_screenHeight;
uniform float u_screenWidth;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_depthTex;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float rand(float co){
   return fract(sin(dot(vec2(co,co) ,vec2(12.9898,78.233))) * 43758.5453);
}
                                                                                      
vec4 bloom()                                                                           
{                                                                                                                                                                    
   vec4 sum = vec4(0);
   vec4 outColor = vec4(0);
	//float offsetHeight = 1.0 / u_screenHeight;
	//float offsetWidth = 1.0 / u_screenWidth;
   for(int i= -3 ;i < 3; i++)
   {
        for (int j = -3; j < 3; j++)
        {
            sum += texture2D(u_shadeTex, v_texcoord + vec2(j,i) * 0.002) * 0.25;
        }
   }
       if (length(texture2D(u_shadeTex, v_texcoord).rgb) < 0.3)
    {
       outColor = sum*sum*0.012 + texture2D(u_shadeTex, v_texcoord);
    }
    else
    {
        if (length(texture2D(u_shadeTex, v_texcoord).rgb) < 0.5)
        {
            outColor = sum*sum*0.009 + texture2D(u_shadeTex, v_texcoord);
        }
        else
        {
            outColor = sum*sum*0.0075 + texture2D(u_shadeTex, v_texcoord);
        }
    }
	return outColor;
}                       

void main(){
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time

  //calculate common things
  	vec3 position = texture2D(u_positionTex, v_texcoord).xyz;
	vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
	float depth = texture2D(u_depthTex, v_texcoord).r;
	depth = linearizeDepth( depth, u_zNear, u_zFar );
	float ssao = 1.0;
	//***************SSAO******************
	//SSAO reference: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
	if(u_SSAOToggle > 0)
	{
		float maxDepth = 0.0;
		vec3 center = vec3(position.x, position.y, depth);
		for(int i = 0; i < SAMPLE_SIZE; ++i)
		{	
			vec3 rvec = normalize(u_sampleKernels[i]);			
			vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
			vec3 bitangent = cross(normal, tangent);
			mat3 tbn = mat3(tangent, bitangent, normal);

			vec3 kernelv = vec3(rand(position.x),rand(position.y),(rand(position.z)+1.0) / 2.0);		  
			kernelv = normalize(kernelv);
			float scale = float(i) / float(SAMPLE_SIZE);
			scale = mix(0.1, 1.0, scale * scale);
			kernelv = kernelv * scale ;
			vec3 sample = tbn * kernelv;										
			float sampleDepth = texture2D(u_depthTex, v_texcoord + vec2(sample.x,sample.y)* u_blurRadius).r;
			sampleDepth = linearizeDepth( sampleDepth, u_zNear, u_zFar );
			float samplez = center.z  - (sample * u_blurRadius).z / 2.0;
			// range check & accumulate:
			float rangeCheck = abs(center.z - sampleDepth) < u_blurRadius ? 1.0 : 0.0;
			if(sampleDepth <= samplez)
				maxDepth += 1.0 * rangeCheck;			
		}
		maxDepth = 1.0 - (maxDepth / float(SAMPLE_SIZE));
		ssao = maxDepth;
	}
	//*************************************
	//**************BLOOM******************
	vec3 outColor = texture2D( u_shadeTex, v_texcoord).rgb * ssao;
	if(u_BloomToggle > 0)
	{
		outColor = bloom().rgb * ssao;  
	}
	//************************************
	gl_FragColor = vec4(outColor, 1.0);
}

