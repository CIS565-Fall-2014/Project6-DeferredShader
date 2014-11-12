precision highp float;

#define DISPLAY_TOON 6
#define DISPLAY_MESH 9

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


vec3 calculateToon(vec3 color, float intensity)
{
      vec3 ret = color;
	  if(intensity > 0.8)
	       ret *= 0.8;
	  else if(intensity > 0.6)
	       ret *= 0.6;
	  else if(intensity > 0.4)
	       ret *= 0.4;
	  else ret *= 0.1;
      return ret;
}

// Sobel Filter Application
float determineEdge(sampler2D u_positionTex)
{
   float w = 1.0 / 960.0;
   float h = 1.0 / 540.0;
 
   vec3 N00 = normalize(texture2D(u_positionTex, v_texcoord + vec2(-w,h)).rgb);
   vec3 N01 = normalize(texture2D(u_positionTex, v_texcoord + vec2(0.0,h)).rgb);
   vec3 N02 = normalize(texture2D(u_positionTex, v_texcoord + vec2(w,h)).rgb);

   vec3 N10 = normalize(texture2D(u_positionTex, v_texcoord + vec2(-w,0.0)).rgb);
   vec3 N11 = normalize(texture2D(u_positionTex, v_texcoord + vec2(0.0,0.0)).rgb);
   vec3 N12 = normalize(texture2D(u_positionTex, v_texcoord + vec2(w,0.0)).rgb);

   vec3 N20 = normalize(texture2D(u_positionTex, v_texcoord + vec2(-w,-h)).rgb);
   vec3 N21 = normalize(texture2D(u_positionTex, v_texcoord + vec2(0.0,-h)).rgb);
   vec3 N22 = normalize(texture2D(u_positionTex, v_texcoord + vec2(w,-h)).rgb);

   vec3 G_abs = abs((N00 + 2.0 * N01 + N02) - ( N20 + 2.0 * N21 + N22)) + abs((N02+ 2.0*N12 + N22) - (N00 + 2.0* N10 + N20));
   return  max(max(G_abs.r, G_abs.g), G_abs.b);
}


void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements

  vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
  vec3 objColor = texture2D(u_colorTex, v_texcoord).rgb;
  vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);

  vec3 lightPos = vec3(0.0, 5.0, 5.0);
  vec3 lightColor = vec3(1.0, 1.0, 1.0);
  vec3 lightDir = normalize( lightPos - pos);

  vec3 lightsP[10];
  vec3 lightsC[10];
  vec3 lightsDir[10];

  for(int i = 0; i < 6; ++i)
  {
     lightsP[i] = vec3(0.0, 5.0, float(i-3)*3.0);
	 lightsC[i] = vec3(1.0, 1.0, 1.0);
	 lightsDir[i] = normalize( lightsP[i] - pos);
  }

  float depth = texture2D( u_depthTex, v_texcoord ).x;
  depth = linearizeDepth( depth, u_zNear, u_zFar );
  float specPow = 20.0;
  float intensity = clamp(dot(normal, lightDir), 0.0, 1.0);
  vec3 viewDir = normalize(pos);


  vec3 diffuseColor = vec3(0.0, 0.0, 0.0);
  vec3 specularColor = vec3(0.0);
  for(int i = 0; i < 6; ++i)
  {
     float NdotL = clamp(dot(normal, lightsDir[i]), 0.0, 1.0);
	 diffuseColor += NdotL * lightsC[i];

	 vec3 H = normalize(lightsDir[i] - viewDir);
	 float NdotH = clamp(dot(normal,H), 0.0, 1.0);

	 if(NdotL != 0.0)
	    specularColor += pow(NdotH, specPow) * lightsC[i];
  }

  diffuseColor *= objColor;

  vec3 finalColor = vec3(0.0);
  finalColor += 0.5*(diffuseColor/10.0) + 0.5*(specularColor/10.0);


  if(u_displayType == DISPLAY_TOON)
  {
	 finalColor = calculateToon(finalColor, intensity);
     if(determineEdge(u_positionTex) > 0.5)
         finalColor = vec3(1.0, 1.0, 1.0);
  }
  else if(u_displayType == DISPLAY_MESH)
  {
     if(determineEdge(u_normalTex) > 0.5)
         finalColor = vec3(0.0, 1.0, 0.0);
  }

  gl_FragColor = vec4(finalColor,1.0);
}
