precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_modelview;

varying vec2 v_texcoord;

#define WIDTH 960
#define HEIGHT 540

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    float pixH = 1.0/float(WIDTH);
    float pixW = 1.0/float(HEIGHT);

    vec2 r = vec2(pixW,0.0);
    vec2 u = vec2(0.0,pixH );
	
	//Toon Silouette
	vec4 P00 =  texture2D(u_positionTex,v_texcoord - r + u);
	vec4 P01 =  texture2D(u_positionTex,v_texcoord + u);
	vec4 P02 =  texture2D(u_positionTex,v_texcoord + r + u);
	vec4 P10 =  texture2D(u_positionTex,v_texcoord - r);
	vec4 P11 =  texture2D(u_positionTex,v_texcoord);
	vec4 P12 =  texture2D(u_positionTex,v_texcoord + r);
	vec4 P20 =  texture2D(u_positionTex,v_texcoord - r - u);
	vec4 P21 =  texture2D(u_positionTex,v_texcoord - u);
	vec4 P22 =  texture2D(u_positionTex,v_texcoord + r - u);

	vec4 Gabs = abs( (P00 + 2.0 * P01 + P02 ) - ( P20 + 2.0 * P21 + P22 ) ) + abs((P02 + 2.0 * P12 + P22) - (P00 + 2.0 * P10 + P20));
	float Gf = step(0.2,max(max(Gabs.r,Gabs.g),Gabs.b));

   //lighting
   vec3 lightPos = vec3(0.0,8.0,5.0);
   lightPos = (u_modelview * vec4(lightPos,1.0)).xyz;
   vec3 lightCol = vec3(1.0,1.0,1.0);
   
   vec3 vPos = texture2D(u_positionTex,v_texcoord).rgb;
   vec3 vNormal = normalize(texture2D(u_normalTex,v_texcoord).rgb);
   vec3 L = normalize(lightPos - vPos);
   vec3 R = reflect(-L,vNormal);
   vec3 V = vec3(0.0,0.0,-1.0);
   
   float diffuse = clamp(dot(L,vNormal),0.0,1.0);
   float specular = pow(clamp(dot(-V,R),0.0,1.0),8.0);

   vec3 finalColor =  0.8 * diffuse *texture2D(u_colorTex, v_texcoord).rgb * lightCol + 0.2 * specular * lightCol;
   float D = linearizeDepth(texture2D(u_depthTex,v_texcoord).r,u_zNear,u_zFar);

   if(Gf > 0.5) gl_FragColor = vec4(0.0,0.0,0.0,1.0);
   else gl_FragColor =  vec4(finalColor, 1.0);
}
