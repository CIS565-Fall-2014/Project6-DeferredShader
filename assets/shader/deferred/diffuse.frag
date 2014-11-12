precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_modelview;
uniform mat4 u_projection;

varying vec2 v_texcoord;

#define WIDTH 960
#define HEIGHT 540

#define AO false
#define AO_NUM_SAMP 4.0
#define AO_RADIUS 0.01
#define TOON_SHADING true
#define HALF_NUM_LIGHTS 2
#define LIGHT_GAP 8.0


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    float pixH = 1.0/float(WIDTH);
    float pixW = 1.0/float(HEIGHT);

    vec2 r = vec2(pixW,0.0);
    vec2 u = vec2(0.0,pixH );

   
    vec3 vPos = texture2D(u_positionTex,v_texcoord).rgb;
    vec3 vNormal = normalize(texture2D(u_normalTex,v_texcoord).rgb);
	vec3 SSnormal = normalize(u_projection * vec4(vNormal,0.0)).xyz;
	
	//AO stuff
	float ambFactor = 1.0;
	if(AO)
	{
		vec3 center = vec3( v_texcoord, texture2D(u_depthTex,v_texcoord).r);
		float totalSample = 0.0;
		float visibleSample = 0.0;
		for(float i = - AO_RADIUS;i< AO_RADIUS; i+=  AO_RADIUS/AO_NUM_SAMP )
		{
			for(float j = - AO_RADIUS;j< AO_RADIUS; j+=  AO_RADIUS/AO_NUM_SAMP )
			{
				for(float k = - AO_RADIUS;k< AO_RADIUS; k+=  AO_RADIUS/AO_NUM_SAMP )
				{
					vec3 dir = vec3(i,j,k);
					if(length(dir) > AO_RADIUS || dot(dir,SSnormal) < 0.0) continue;
					else
					{
						vec3 pos = center + dir;
						float d = texture2D( u_depthTex, pos.xy).r;
						if(pos.z < d && linearizeDepth(d,u_zNear,u_zFar) < 0.9) visibleSample += 1.0;
						totalSample += 1.0;
					}
		   
				}  
			}
		}

		ambFactor = visibleSample/totalSample;
	}

	//////////////////////////////////////
	
	//Toon Silouette
	float Gf = 0.0;
	if(TOON_SHADING)
	{
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
		Gf = step(2.0,max(max(Gabs.r,Gabs.g),Gabs.b));

	}
	/////////////////////////////////////

    //lighting
	float diffuse = 0.0;
	float specular = 0.0;
        vec3 V = vec3(0.0,0.0,-1.0);
	vec3 lightCol = vec3(1.0,1.0,1.0);

	for(int i = -HALF_NUM_LIGHTS; i < HALF_NUM_LIGHTS; ++i)
	{
	   vec3 lightPos = vec3(float(i) * LIGHT_GAP,5.0,1.0);
	   lightPos = (u_modelview * vec4(lightPos,1.0)).xyz;


	   vec3 L = normalize(lightPos - vPos);
	   vec3 R = reflect(-L,vNormal);

   
	   diffuse += clamp(dot(L,vNormal),0.0,1.0);
	   specular += pow(clamp(dot(-V,R),0.0,1.0),20.0);
	}




   if(TOON_SHADING)
   {
       if(diffuse <0.2) diffuse = 0.1;
	   else if(diffuse < 0.4) diffuse = 0.3;
	   else if (diffuse < 0.6) diffuse = 0.5;
	   else if (diffuse < 0.8) diffuse = 0.7;
           else diffuse = 0.9;

       if(specular <0.3) specular = 0.15;
	   else if(specular < 0.66) specular = 0.33;
	   else specular = 0.66;


   }

   vec3 finalColor =  0.7 * diffuse *texture2D(u_colorTex, v_texcoord).rgb * lightCol + 0.3 * specular * lightCol;
   float linearD = linearizeDepth(texture2D(u_depthTex, v_texcoord).r,u_zNear,u_zFar);
   		
	if(Gf > 0.5) gl_FragColor = vec4(0.0,0.0,0.0,linearD);
        else if(AO) gl_FragColor =  vec4(vec3(ambFactor), linearD);
	else gl_FragColor =  vec4( finalColor, linearD);
}
