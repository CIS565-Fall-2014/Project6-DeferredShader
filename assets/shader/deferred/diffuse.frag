precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_eyePos;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

//uniform float u_kernel[25];    //5*5 kernel
//uniform float u_offset;     //texture coord offset

varying vec2 v_texcoord;



float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
	vec3 position = texture2D(u_positionTex,v_texcoord).xyz;
	vec3 normal = texture2D(u_normalTex,v_texcoord).xyz;
	vec3 color = texture2D(u_colorTex,v_texcoord).xyz;
	float depth = texture2D(u_depthTex,v_texcoord).x;
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
