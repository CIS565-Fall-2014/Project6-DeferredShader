precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_modelview;
uniform float u_time;

varying vec2 v_texcoord;

#define Halfnumberoflights 20.0
#define BlurNum 10.0
#define WIDTH 960
#define HEIGHT 540
#define PI 3.1415926

#define Multi_Lights false
#define Toon_Shading_Basic false
#define Bloom_Shading false
#define Screen_Space_Ambient_Occlusion false

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float randF(float x){
    return fract(sin(x*23.131411231) * 43758.5453);
}

float gaussian(int i, float width) {
	return exp(-abs(float(i))/width);
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  vec2 fixed_coord = v_texcoord;
  fixed_coord.x = 1.0-fixed_coord.x;

  vec3 vpos = texture2D(u_positionTex, fixed_coord).rgb;
  vec3 vnormal = normalize(texture2D(u_normalTex, fixed_coord).rgb);

  //light1
  vec3 light_pos = vec3(0.0, 3.0, 5.0);
  light_pos = (u_modelview*vec4(light_pos,1.0)).xyz;
  vec3 light_col = vec3(1.0, 1.0, 1.0);

  vec3 lightDir = normalize(light_pos - vpos);
  vec3 reflection = reflect(-lightDir, vnormal);
  vec3 view = vec3(0.0, 0.0, -1.0);

  float intensity = dot(lightDir, vnormal);
  float diffuse = clamp(intensity, 0.0, 1.0);
  float specular = pow(clamp(dot(-view, reflection), 0.0, 1.0), 10.0);

  vec3 color = 0.6*diffuse*texture2D(u_colorTex, fixed_coord).rgb*light_col + 0.4*specular*light_col;


  //Test1---additional multiple lights
  if(Multi_Lights){
	for(float i=-Halfnumberoflights; i<Halfnumberoflights; i++){
	  light_pos += vec3(5.0/Halfnumberoflights, -5.0/Halfnumberoflights, 0.0);
	  light_pos = (u_modelview*vec4(light_pos,1.0)).xyz;
	  light_col = vec3(1.0, 0.0, 0.0);

	  lightDir = normalize(light_pos - vpos);
	  reflection = reflect(-lightDir, vnormal);
	  view = vec3(0.0, -1.0, 0.0);

	  intensity = dot(lightDir, vnormal);
	  diffuse = clamp(intensity, 0.0, 1.0);
	  specular = pow(clamp(dot(-view, reflection), 0.0, 1.0), 10.0);

	  color += 0.6*diffuse*texture2D(u_colorTex, fixed_coord).rgb*light_col + 0.4*specular*light_col;
	}
  }
  
  //Test2---Toon Shading
  //reference...http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/
  if(Toon_Shading_Basic){
	if (intensity > 0.95)
		color = vec3(1.0,0.5,0.5);
	else if (intensity > 0.5)
		color = vec3(0.6,0.3,0.3);
	else if (intensity > 0.25)
		color = vec3(0.4,0.2,0.2);
	else
		color = vec3(0.2,0.1,0.1);
  }
	
  //Test3---Bloom shading
  //bloom
  if(Bloom_Shading){
	  float pixHeight = 1.0/float(HEIGHT);
	  float pixWidth = 1.0/float(WIDTH);
	  vec2 right_dir = vec2(pixWidth, 0.0);
	  vec2 up_dir = vec2(0.0, pixHeight);

	   for (int i = -10; i <= 10; i++) {
		for (int j = -10; j <= 10; j++) {
			color += gaussian(i, 50.0) * gaussian(j, 50.0) * texture2D(u_colorTex, fixed_coord + vec2(pixWidth*float(i), pixHeight*float(j))).rgb / 1024.0;
		}
	  }
 }

 vec4 finalcolor = vec4(color, 1.0);

 //Test4---SSAO---not finished
  //ssao
  float ambFactor = 1.0;
  if(Screen_Space_Ambient_Occlusion){

	vec3 center = vec3( fixed_coord, texture2D(u_depthTex,fixed_coord).r);
	float totalSample = 0.0;
	float visibleSample = 0.0;
	
	//ambFactor = visibleSample/totalSample;
	finalcolor *= ambFactor;

 }


  gl_FragColor = finalcolor;

}
