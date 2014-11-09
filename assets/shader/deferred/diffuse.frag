precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
uniform mat4 u_modelview;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
	// Write a diffuse shader and a Blinn-Phong shader
	// NOTE : You may need to add your own normals to fulfill the second's requirements

	vec3 color = texture2D( u_colorTex, v_texcoord ).xyz;
	vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
	vec3 position = texture2D(u_positionTex, v_texcoord).rgb;
	float depth = texture2D(u_depthTex, v_texcoord).r;
	depth = linearizeDepth( depth, u_zNear, u_zFar );


	vec3 lightColor = vec3(1.0, 1.0, 1.0);	
	vec3 lightPos = vec3(0.0, 0.0, 10.0);
	vec3 lightDir = normalize((u_modelview * vec4(lightPos,1.0)).xyz - position);

	vec3 toReflectedLight = reflect(-lightDir, normal);
	vec3 eyeToPosition = normalize(position);

	float diffuse = clamp(dot(lightDir, normal),0.0,1.0);
	float specular = max(dot(toReflectedLight, -eyeToPosition), 0.0);
	specular = pow(specular, 5.0);


	vec3 finalColor =  0.5 * diffuse *texture2D(u_colorTex, v_texcoord).rgb + 0.5 * specular * lightColor;
	//vec3 finalColor = diffuse * lightColor;
	//vec3 finalColor = specular * lightColor;
	//////////////////////////////////////////////////////////////////////
	if(color.x == 1.0)
		gl_FragColor = vec4(finalColor, 1.0);
	else
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

	    //gl_FragColor = vec4( normal, 1 );
  
  
}
