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
	
	vec3 position = texture2D(u_positionTex, v_texcoord).rgb;
	vec3 normal = texture2D( u_normalTex, v_texcoord ).rgb;
	vec3 color = texture2D( u_colorTex, v_texcoord ).rgb;
	float depth = texture2D(u_depthTex, v_texcoord).r;
	
    vec3 lightPos = vec3(5.0, 5.0, 5.0);
    vec3 lightDir = normalize((u_modelview * vec4(lightPos,1.0)).xyz - position);
	vec3 reflect = reflect(-lightDir, normal);
    float diffuse = clamp(dot(lightDir, normal),0.0,1.0);
	float specular = pow(max(dot(reflect, -normalize(position)), 0.0), 25.0);
	
    gl_FragColor = diffuse * vec4(color, 1.0) + 0.2 * specular * vec4(1.0,1.0,1.0,1.0);
}
