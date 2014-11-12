precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
uniform sampler2D u_noiseTex;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_eyePos;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

//uniform float u_kernel[25];    //5*5 kernel
//uniform float u_offset;     //texture coord offset

varying vec2 v_texcoord;

uniform float u_kernel3[48];   //3*16 sample
uniform mat4 u_perspMat;

uniform float u_offset;     //texture coord offset in width
uniform float u_offset2;   //texture coord offset in height


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
	vec2 texcoord = v_texcoord;
	vec3 position = texture2D(u_positionTex,texcoord).xyz;
	vec3 normal = texture2D(u_normalTex,texcoord).xyz;
	vec3 color = texture2D(u_colorTex,texcoord).xyz;
	float depth = texture2D(u_depthTex,texcoord).x;
	depth = linearizeDepth(depth, u_zNear, u_zFar);
	//vec3 backGround = vec3(0.686, 0.933, 0.933);
	vec3 backGround = vec3(0.0, 0.0, 0.0);
	normal = normalize(normal);
	
	float diffuseTerm = abs(dot( normal,  normalize(u_lightDir )));
	diffuseTerm =  clamp(diffuseTerm, 0.0, 1.0);
	
	if(depth<0.99){
		if(u_displayType == 1 ){
			gl_FragColor = vec4(color, 1.0);
		}
		if(u_displayType == 5){  
			gl_FragColor = vec4(0.6*diffuseTerm * u_lightColor * color , 1.0);
		}
		else if (u_displayType == 6){
			vec3 viewDir = normalize(position - u_eyePos);
			vec3 reflectedLightDir = reflect(u_lightDir, normal);
			float specularTerm = abs(dot(reflectedLightDir, viewDir));
			specularTerm = pow(specularTerm, 3.0);
			
			//float specularTerm = pow(diffuseTerm, 3.0);
			gl_FragColor = vec4((0.6*diffuseTerm + 0.4 * specularTerm )* u_lightColor * color , 1.0);
		}
		else if(u_displayType == 7){
		
			//gl_FragColor = vec4(color, depth);
			gl_FragColor = vec4(0.6*diffuseTerm * u_lightColor * color ,depth);
			
		}
		else if(u_displayType == 8){
			gl_FragColor = vec4(color, diffuseTerm);
		/*	if (diffuse > 0.951)   //cos(18)
				toon = vec3(1.0,0.5,0.5);
			else if(diffuse > 0.809)   //cos(36)
				toon = vec3(0.8,0.4,0.4);
			else if (diffuse > 0.587)   //cos(54)
				toon = vec3(0.6,0.3,0.3);
			else if (diffuse > 0.309)    //cos(72)
				toon = vec3(0.4,0.2,0.2);
			else if (diffuse > 0.01)    //cos(90)
				toon = vec3(0.2,0.1,0.1);
				
			gl_FragColor = vec4(toon,1.0);
			*/
		}
		else if(u_displayType == 9){
			//gl_FragColor = vec4(position, depth);
			
			float AO = 0.0;
			vec2 coeff = vec2(1.0/(u_offset*4.0), 1.0/(u_offset2*4.0));  //noise texture is 4x4 yet the entire image is width x height
			vec3 noise = texture2D(u_noiseTex, texcoord * coeff).rgb;   //random rotation kernel
			//gl_FragColor = vec4(abs(noise), 1.0);
			
			vec3 tangent = normalize(noise - normal * dot(noise, normal));   //Gram-Schmidt process
			vec3 bitangent = cross(normal, tangent);
			mat3 tbn = mat3(tangent, bitangent, normal);   //use this to transform sample kernel
		
			float radius = 5.0;
			vec3 direction;
			vec3 sample;
			vec4 sampleTexcoord;
			float sampleDepth;
			for (int i = 0; i < 16; i++) {   //sample kernel3 size is 16
				//get hemisphere sample position in view space
			   direction = tbn * vec3(u_kernel3[i*3+0], u_kernel3[i*3+1], u_kernel3[i*3+2]);
			   sample = direction * radius + position;
			  
				//project sample position in screen space
			   sampleTexcoord = u_perspMat * vec4(sample, 1.0);
			   sampleTexcoord.xy /= sampleTexcoord.w;
			   sampleTexcoord.xy = sampleTexcoord.xy * 0.5 + 0.5;
			  
				//get sample depth
			   sampleDepth = texture2D(u_depthTex, sampleTexcoord.xy).r;
			   sampleDepth = linearizeDepth(sampleDepth, u_zNear, u_zFar);
			  
				//accumulate if occluded
			   if(sampleDepth <= sample.z && abs(position.z - sampleDepth) < radius)
					AO += 1.0;
			}
			//gl_FragColor = vec4(sampleTexcoord.rgb, 1.0);

			AO = 1.0 - (AO /16.0);
			gl_FragColor = vec4(AO, AO, AO, 1.0);  //then pass into post.frag to blur!
	
		}
	}
	else{
		gl_FragColor = vec4(backGround, 0);
	}
	//gl_FragColor = vec4(u_lightColor,1.0);
	//gl_FragColor = vec4(u_lightDir,1.0);
	   
	//vec3 lightDir = vec3(0.0, 1.0, 1.0);
	//vec3 lightCol = vec3(1.0,1.0,0.0);
	//gl_FragColor = vec4(vec3(dot(lightDir, normal)) * color * lightCol, 1.0);
}
