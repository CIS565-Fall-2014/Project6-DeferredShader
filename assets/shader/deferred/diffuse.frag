precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform vec3 u_lPos;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

// Found this rand function online.
float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
  vec3 norm = texture2D(u_normalTex, v_texcoord).rgb;
  vec3 col = texture2D(u_colorTex, v_texcoord).rgb;
  
  vec3 lDir = normalize(u_lPos - pos);
  vec3 vdir = vec3(0, 0, 1.0);
  vec3 H = normalize(lDir + vdir);
  float diffuse = clamp(dot(lDir, norm), 0.0, 1.0);
  
  //----------------
  // Cell Shading
  // Use a step function for the color based on diffuse term.
  float toonDiffuse = float(int(diffuse * 4.0)) / 3.0;
  
  //----------------
  // Color (Blinn-Phong shading)
  // TODO: Add control to modify specular component and specular/diffuse weighting
  float spec = pow(clamp(dot(H, norm), 0.0, 1.0), 100.0);
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  gl_FragColor = vec4(col * toonDiffuse + spec, 1.0);
    //gl_FragColor = vec4(vec3(abs(dot(norm, normalize(pos - vdir)))), 1);
}
