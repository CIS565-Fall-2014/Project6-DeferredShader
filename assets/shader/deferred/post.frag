precision highp float;

uniform sampler2D u_colorTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_depthTex;
uniform sampler2D u_shadeTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_width;
uniform int u_height;
uniform int u_displayType;
uniform vec3 u_kernel[100];

varying vec2 v_texcoord;

float texelHeight = 1.0 / float(u_height);
float texelWidth = 1.0 / float(u_width);

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float round(float f, int num) {
  return floor(float(num+1)*f)/float(num);
}

//This function blurs the depth buffer and subtracts it from the original (a high pass filter)
float detectEdge() {

  float result = linearizeDepth(texture2D(u_depthTex, v_texcoord).x, u_zNear, u_zFar);
  for (int i = -4; i <= 4; i++) {
	for (int j = -4; j <= 4; j++) {
		result -= linearizeDepth(texture2D(u_depthTex, v_texcoord + vec2(texelWidth*float(i), texelHeight*float(j))).x, u_zNear, u_zFar)/(81.0);
	}
  }
  return result;
}

//This function acts as a 1D gaussian
float gaussian(int i, float width) {
	return exp(-abs(float(i))/width);
}

//Toon Shading, Influenced by Unity 3D
vec4 toonShader(vec3 color, int numColors) {
  // Flatten the color
  vec3 p_color = vec3(round(color.r, numColors), round(color.g, numColors), round(color.b, numColors));
  // Sharpen the edges
  return abs(detectEdge()) > 0.001 ? vec4(vec3(0.0), 1.0) : vec4(p_color, 1.0);
}

//Screen Space Ambient Occlusion, inspired by the Crytek Approach (though modified to benefit from deferred shading)
vec4 SSAO(vec3 color) {
  float occlusion = 0.0;

  vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
  vec3 position = texture2D(u_positionTex, v_texcoord).xyz;

  vec3 rvec = vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal);

  float thisDepth = linearizeDepth(texture2D(u_depthTex, v_texcoord).x, u_zNear, u_zFar);

  for (int i = 0; i < 100; i++) {
   vec3 sample = tbn * u_kernel[i];
   vec2 offset = sample.xy;
   offset.x *= texelWidth;
   offset.y *= texelHeight;

   float sampleDepth = linearizeDepth(texture2D(u_depthTex, v_texcoord + offset.xy).x, u_zNear, u_zFar);

   occlusion += (thisDepth - sample.z > sampleDepth) ? 1.0 : 0.0;
  }

  occlusion = 1.0 - (occlusion / float(100));

  return vec4(color * occlusion, 1.0);
}

//Bloom Shading, inspired by the Tron 2.0 work
vec4 bloomShader(vec3 color) {
  vec2 coord = v_texcoord;
  coord.x = 1.0-coord.x;

  vec3 blur = color;
  for (int i = -20; i <= 20; i++) {
	for (int j = -20; j <= 20; j++) {
		blur += gaussian(i, 50.0) * gaussian(j, 50.0) * texture2D(u_colorTex, v_texcoord + vec2(texelWidth*float(i), texelHeight*float(j))).rgb / 1000.0;
	}
  }
  return vec4(blur, 1.0);
}

void main()
{
  //TODO: Why is the x coord flipped??
  vec2 coord = v_texcoord;
  coord.x = 1.0-coord.x;

  vec3 color = texture2D(u_shadeTex, coord).rgb;

  vec4 result_color;
  if (u_displayType == 2) {
	result_color = toonShader(color, 4);
  } else if (u_displayType == 3) {
    result_color = SSAO(color);
  } else if (u_displayType == 4) {
    result_color = bloomShader(color);
  } else {
	result_color = vec4(color, 1.0);
  }

  gl_FragColor = result_color;
  
}
