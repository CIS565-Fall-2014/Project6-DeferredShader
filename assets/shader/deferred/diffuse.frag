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

#define AO_RADIUS 5.0

#define WIDTH 960.0
#define HEIGHT 540.0

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
  vec3 norm = texture2D(u_normalTex, v_texcoord).rgb;
  vec3 col = texture2D(u_colorTex, v_texcoord).rgb;
  float depth = linearizeDepth(texture2D(u_depthTex, v_texcoord).r, u_zNear, u_zFar);  
  float zdepth = -1.0;
  if (pos.z < 0.0) {
    zdepth = pos.z / u_zFar;
  }
  
  vec3 lDir = normalize(u_lPos - pos);
  vec3 vdir = vec3(0, 0, 1.0);
  vec3 H = normalize(lDir + vdir);
  
  //----------------
  // Color (Blinn-Phong shading)
  // TODO: Add control to modify specular component and specular/diffuse weighting
  float diffuse = clamp(dot(lDir, norm), 0.0, 1.0);
  float spec = pow(clamp(dot(H, norm), 0.0, 1.0), 100.0);
  
  //----------------
  // Cell Shading
  // Use a step function for the color based on diffuse term.
  float toonDiffuse = diffuse + spec;
  if (diffuse > 0.95) {
    toonDiffuse = 1.0;
  } else if (diffuse > 0.5) {
    toonDiffuse = 0.6;
  } else if (diffuse > 0.25) {
    toonDiffuse = 0.4;
  } else {
    toonDiffuse = 0.2;
  }
  
  vec2 dx = vec2(1.0/WIDTH, 0);
  vec2 dy = vec2(0, 1.0/HEIGHT);
  
  //-----------------------
  // Ambient Occlusion
  float AO = 0.0;
  
  vec2 texcoordSample;
  float D = -norm.x * pos.x - norm.y * pos.y - norm.z * pos.z;
  for (float i = -AO_RADIUS; i <= AO_RADIUS + 0.1; i++) {
    for (float j = -AO_RADIUS; j <= AO_RADIUS + 0.1; j++) {
      texcoordSample = v_texcoord + i * dx + j * dy;
      vec3 p2 = texture2D(u_positionTex, texcoordSample).xyz;
      if ( p2.z < 0.0 &&
        p2.z > -(norm.x * p2.x + norm.y * p2.y + D) / norm.z + 0.01){//pos.z){//} + 1.0 - norm.z) {
        AO += 1.0;
      }
    }
  }
  AO = 1.0 - AO / pow(2.0 * AO_RADIUS + 1.0, 2.0);
  
  
  // NOTE: Writing depth into the shade buffer as the alpha value because the alpha is always 1.
  // Uses a different depth value since the one saved in the depth texture is weird for large scenes.
  //  (possibly due to the linearizeDepth() function).
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, -zdepth);
  gl_FragColor = vec4(col * (diffuse + spec) * AO, -zdepth);
  //gl_FragColor = vec4(col * (toonDiffuse), -zdepth);
    //gl_FragColor = vec4(vec3(abs(dot(norm, normalize(pos - vdir)))), -zdepth);
}
