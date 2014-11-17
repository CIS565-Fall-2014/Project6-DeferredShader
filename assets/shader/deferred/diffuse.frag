precision highp float;

#define DISPLAY_BLINN 5
#define DISPLAY_BLOOM 6
#define DISPLAY_TOON 7
#define DISPLAY_AO 8
#define DISPLAY_PIXEL 9
#define DISPLAY_GLASS 0

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform float u_pixWidth;
uniform float u_pixHeight;

//ra
uniform mat4 u_mvp; //modelview
uniform vec3 u_eye;

varying vec2 v_texcoord;

struct Light{
	float emit;
	vec3 pos;
	vec3 color;
};

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec3 myNormalize(vec3 norm)
{
	float normlength = length(norm);
	if(normlength < 0.0001) normlength = 0.0001;
	return norm/normlength;
}



void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);

  // initialize multiple lights
  // int lightNum = 1;
   Light lights[2];
   lights[0].emit = 5.0;
   lights[0].pos =  vec3(-2.0, 5.0, 2.0);
   lights[0].pos = (u_mvp * vec4(lights[0].pos,1.0)).xyz;
   lights[0].color = vec3(1.0, 1.0, 1.0);

   lights[1].emit = 10.0;
   lights[1].pos =  vec3(6.0, 5.0, 2.0);
   lights[1].pos = (u_mvp * vec4(lights[1].pos,1.0)).xyz;
   lights[1].color = vec3(1.0, 0.0, 0.2);

   vec3 lightpos = vec3(0.0, 5.0, 2.0);
   lightpos = (u_mvp * vec4(lightpos,1.0)).xyz;
   vec3 lightcolor = vec3(1.0,0.5,0.0);


   // this point
   vec3 myPos = texture2D(u_positionTex,v_texcoord).rgb;
   vec3 myNorm = texture2D(u_normalTex,v_texcoord).rgb;
   myNorm = myNormalize(myNorm);
   float myDepth = texture2D( u_depthTex, v_texcoord ).r;
   myDepth = linearizeDepth(myDepth, u_zNear, u_zFar);
   vec3 myColor = texture2D(u_colorTex, v_texcoord).rgb;

   vec3 colorSum = vec3(0.0,0.0,0.0);

 //  
   

//BLINN-PHONG
for(int l = 0; l < 2; l++)
	{

	  vec3 lightDir = myNormalize( lights[l].pos - myPos );
	 // vec3 lightDir = myNormalize( lightpos - myPos );
	  float dist = length(lightDir) * length(lightDir);
		  
		float NdotL = dot(myNorm, lightDir);
		NdotL = (NdotL > 0.0) ? NdotL : 0.0;
		vec3 diffuseColor = NdotL * vec3(0.0, 1.0, 0.0)/dist;

	    vec3 viewDir= myNormalize( u_eye - myPos );
		vec3 H = myNormalize( lightDir + viewDir);
		  
		float NdotH = dot( myNorm, H);
		NdotH = ( NdotH > 0.0) ? NdotH : 0.0;
		float intensity = pow(NdotH, 20.0);
		vec3 specularColor = vec3(1.0,1.0,1.0) * intensity/dist;

		colorSum += lights[l].emit * lights[l].color * (0.7 * diffuseColor + 0.3 * specularColor);
		//  colorSum = 20.0 * lightcolor * (0.7 * diffuseColor + 0.3 * specularColor);
	}
	gl_FragColor = vec4(colorSum/2.0, 1.0);

	if(myDepth > 1.0) gl_FragColor = vec4(0.8, 0.0, 0.55, 1.0);

}



