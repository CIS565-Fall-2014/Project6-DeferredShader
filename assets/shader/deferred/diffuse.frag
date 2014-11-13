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
  vec4 lightColor = vec4(0.5, 0.5, 0.5, 1.0);
  vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
  
  vec3 position = texture2D(u_positionTex, v_texcoord).xyz;
  vec3 lightDir = normalize(u_Light.xyz - position);
  vec3 diffuseColor = texture2D(u_colorTex, v_texcoord).rgb;
  float diffuseTerm = clamp(abs(dot(normalize(normal), normalize(lightDir))), 0.0, 1.0);//max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

 
  vec3 viewDir = normalize(-position);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(dot(halfDir, normal), 0.0);
  specular = pow(specAngle, 80.0);
 

  //change background color
  float depth = texture2D( u_depthTex, v_texcoord ).x;
  depth = linearizeDepth( depth, u_zNear, u_zFar );

  if (depth > 0.99) {
    gl_FragColor = vec4(vec3(0.0), 1.0);//vec4(vec3(u_displayType == 5 ? 0.0 : 0.0), 1.0);
  } else {
    gl_FragColor = vec4(diffuseTerm*diffuseColor + specular*vec3(1.0), 1.0);
  }

}