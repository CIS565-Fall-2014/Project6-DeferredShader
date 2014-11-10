precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform vec4 u_Light;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{

  // Diffuse calculation
  vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
  vec3 position = texture2D(u_positionTex, v_texcoord).xyz;
  vec3 lightDir = normalize(u_Light.xyz - position);
  vec3 diffuseColor = texture2D(u_colorTex, v_texcoord).rgb;
  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  // Add blinn-phong step
  if(lambertian > 0.0) {
    vec3 viewDir = normalize(-position);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, 32.0);
  }

  // Use depth to make the background white
  float depth = texture2D( u_depthTex, v_texcoord ).x;
  depth = linearizeDepth( depth, u_zNear, u_zFar );

  if (depth > 0.99) {
	gl_FragColor = vec4(vec3(u_displayType == 4 ? 0.0 : 1.0), 1.0);
  } else {
	gl_FragColor = vec4(lambertian*diffuseColor + specular*vec3(1.0), 1.0);
  }

}

