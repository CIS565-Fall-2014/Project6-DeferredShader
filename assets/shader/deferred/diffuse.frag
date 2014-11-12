precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

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
  vec3 lightCol = vec3(1,1,1);
  
  vec3 lightPos = vec3(5, 5, 5);
  vec3 eyePos = vec3(0, 1, 5);
  
  vec3 lightDir = texture2D(u_positionTex, v_texcoord).rgb - lightPos;
  float diffuseTerm = clamp(dot(-lightDir, texture2D(u_normalTex, v_texcoord).rgb), 0.0, 1.0);
  
  vec3 viewDir = texture2D(u_positionTex, v_texcoord).rgb - eyePos;
  vec3 refDir = reflect(lightDir, texture2D(u_normalTex, v_texcoord).rgb);
  float specTerm = clamp(dot(refDir, -viewDir), 0.0, 1.0);
  
  vec3 diff = lightCol * diffuseTerm * texture2D(u_colorTex, v_texcoord).rgb;
  vec3 spec = lightCol * pow(specTerm, 100.0);
  
  gl_FragColor = vec4(0.5 * diff + 0.5 * spec, 1.0);
}
