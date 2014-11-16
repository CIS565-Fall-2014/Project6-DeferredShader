precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;


/////////////////////////////
uniform sampler2D u_extraTex;
////////////////////////////

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
//
uniform vec2 u_textureSize;

varying vec2 v_texcoord;

//light
const vec3 lightPos = vec3(-2.0, 3.0, 1.0);

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}


void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  gl_FragColor = vec4(vec3(0,0,0) , 1.0);
  
  vec3 position  = texture2D(u_positionTex, v_texcoord).rgb;
  vec3 normal    = texture2D(u_normalTex,   v_texcoord).rgb;
  vec3 color     = texture2D(u_colorTex, v_texcoord).rgb;
  float depth    = texture2D( u_depthTex, v_texcoord ).x;
  depth          = linearizeDepth(depth, u_zNear, u_zFar);
  vec3 lightDir  = normalize(lightPos - position);
  float diffuse  = max(dot(lightDir, normal), 0.0);
  vec3  diffCol  = diffuse * color;
  
  ////////////////////////////////////////
  //begin Toon Shader
  ////////////////////////////////////////
  
  if(diffuse < .35){
    color = vec3(0,0,0);
  }else if(diffuse < .70){
    color = vec3(.33,0,0);
  }else if(diffuse < .90){
    color = vec3(.66,0,0);
  }else{
    color = vec3(1,0,0);
  }
  if (depth > .99){
    color = vec3(.33,.33,.33);
  }
  
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  gl_FragColor = vec4(color, 1.0);
  //gl_FragColor = vec4(diffCol + specular , 1.0);
  //gl_FragColor = vec4((1.0 - accumulatedAO) * (diffCol + specular) , 1.0);
  //gl_FragColor = vec4(texture2D(u_extraTex, v_texcoord).rgb, 1.0);
}
