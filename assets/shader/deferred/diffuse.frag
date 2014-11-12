precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform float u_width;
uniform float u_height;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

int isEdge(float myDepth){
	for (int i=-4; i<4; i+=1){
		for (int j=-4; j<4; j+=1){
			vec2 offset = v_texcoord + vec2(1.0/float(u_width)*float(i), 1.0/float(u_height)*float(j));
			float otherDepth = texture2D(u_depthTex, offset).r;
			float otherLinearDepth = linearizeDepth(otherDepth, u_zNear, u_zFar);
			if (otherLinearDepth > 0.99){
				return 1;
			}
		}
	}
	return 0;
}

void diffuseShader(vec3 lightPosition, vec3 lightColor, vec3 position, vec3 normal, vec3 color){
  float ambientTerm = 0.25;
  
  vec3 toLight = normalize(lightPosition - position);
  float diffuseComponent = clamp(dot(toLight, normal)+ambientTerm, 0.0, 1.0);
  
  vec3 refl = reflect(-toLight, normal);
  vec3 viewDir = vec3(0,0,-1);
  float specularComponent = pow(clamp(dot(-viewDir, refl),0.0,1.0),8.0);
  vec4 fragmentColor = vec4(diffuseComponent*color*lightColor + specularComponent*lightColor, 1.0);
  gl_FragColor = fragmentColor;
}

void toon(float linearDepth, vec3 lightPosition, vec3 lightColor, vec3 position, vec3 normal, vec3 color){

	vec4 fragmentColor = gl_FragColor;
  
	vec3 toLight = normalize(lightPosition - position);

	if (linearDepth > 0.99){
		fragmentColor = vec4(0.25,0.25,0.25,1);
		gl_FragColor = fragmentColor;
		return;
	}
	float intensity = dot(toLight, normal);
  
	int amEdge = isEdge(linearDepth);
	if (amEdge == 1){
		gl_FragColor = vec4(0,0,0,1);
		return;
	}
  
	if (intensity > 0.95)
		fragmentColor = vec4(color,1.0);
	else if (intensity > 0.5)
		fragmentColor = vec4(0.5*color,1.0);
	else if (intensity > 0.25)
		fragmentColor = vec4(0.25*color,1.0);
	else
		fragmentColor = vec4(0.1*color,1.0);
		
	gl_FragColor = fragmentColor;
}

void ssao(){
	float depth = texture2D(u_depthTex, v_texcoord).r;
	float linearDepth = linearizeDepth(depth, u_zNear, u_zFar);
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  
  float depth = texture2D(u_depthTex, v_texcoord).r;
  float linearDepth = linearizeDepth(depth, u_zNear, u_zFar);
  
  gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  vec3 lightPosition = vec3(0,10,0);
  vec3 lightColor = vec3(1,1,1);
  vec3 position = texture2D(u_positionTex, v_texcoord).rgb;
  vec3 normal = texture2D(u_normalTex, v_texcoord).rgb;
  vec3 color = texture2D(u_colorTex, v_texcoord).rgb;
  
  gl_FragColor = vec4(normal,1.0);
  
  diffuseShader(lightPosition, lightColor, position, normal, color);
  //toon(linearDepth, lightPosition, lightColor, position, normal, color);
  //ssao();
}
