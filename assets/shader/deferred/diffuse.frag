precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
//uniform vec3 u_cameraPos;

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
  
  vec3 normal = texture2D(u_normalTex, v_texcoord).rgb;
  vec3 position = texture2D(u_positionTex, v_texcoord).rgb;
  float depth = texture2D(u_depthTex, v_texcoord).r;
  depth = linearizeDepth( depth, u_zNear, u_zFar );
  
  //vec3 cameraToFrag = vec3(0.0, 0.0, 1.0);
  
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diffuse = clamp(dot(lightDir, normal), 0.0, 1.0);
  
  //vec3 toReflectedLight = reflect(-u_CameraSpaceDirLight, normal);
  //vec3 eyeToPosition = normalize(position);
  //float specular = max(dot(toReflectedLight, -eyeToPosition), 0.0);
  
  gl_FragColor = vec4(diffuse,diffuse,diffuse, 1.0);
  
  
  //gl_FragColor = vec4(texture2D(u_depthTex, v_texcoord).rgb, 1.0);
  
  
}
