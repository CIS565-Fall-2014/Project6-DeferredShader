precision highp float;
#define DIFFUSE 	5
#define BLOOM 		6
#define TOON 		7
#define SSAO 		8
#define ALL			9


uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_modelview;

varying vec2 v_texcoord;


uniform vec3 lgtPos;
uniform vec3 lgtClr;


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
  
	vec3 clr = texture2D( u_colorTex, v_texcoord ).xyz;
	vec3 nml = texture2D( u_normalTex, v_texcoord ).xyz;
	vec3 pos = texture2D(u_positionTex, v_texcoord).rgb;
	float dp = texture2D(u_depthTex, v_texcoord).r;
	dp = linearizeDepth( dp, u_zNear, u_zFar );
	
	//vec3 lgtClr = vec3(1.0);	
	//vec3 lgtPos = vec3(0.0, 0.0, 5.0);
	vec3 lgtDir = normalize(( vec4(lgtPos,1.0)).xyz - pos);

	vec3 refDir = reflect(-lgtDir, nml);
	vec3 eyeDir = normalize(pos);
	
	vec3 outClr=vec3(0.0);
	if(u_displayType!=TOON&&u_displayType!=ALL){
		float diffuse = clamp(dot(lgtDir, nml),0.0,1.0);
		float specular = max(dot(refDir, -eyeDir), 0.0);
		specular = pow(specular, 10.0);


		outClr =  0.5 * diffuse * lgtClr + 0.5 * specular * lgtClr;
	}
	else if(u_displayType!=TOON){
		float diffuse = clamp(dot(lgtDir, nml),0.0,1.0);
		float specular = max(dot(refDir, -eyeDir), 0.0);
		specular = pow(specular, 10.0);


		outClr =  0.5 * diffuse * lgtClr + 0.5 * specular * lgtClr;
	}
	else {
		vec3 clr0=lgtClr;
		vec3 clr1=.2*lgtClr;
		float toonSel=max(0.0,dot(lgtDir,nml));
		
		if(toonSel>.8) 
			outClr=clr0;
		else if(toonSel>.6)
			outClr=mix(clr0,clr1,toonSel*2.5-1.0);
		else if(toonSel>.4)
			outClr=mix(clr0,clr1,(toonSel)*1.25);
		else if(toonSel>.2)
			outClr=mix(clr0,clr1,(toonSel)*.625);
		else
			outClr=mix(clr0,clr1,(toonSel)*.3125);
		
		float mag=0.0;
		
		for(int i=-1;i<=3;i++){
			for(int j=-1;j<=3;j++){
				float x=(float(i)-1.0)/1024.0;
				float y=(float(j)-1.0)/512.0;
				
				float Nearby=texture2D(u_depthTex,v_texcoord+vec2(x,y)).x;
				
				if(Nearby>.99){
					outClr=vec3(0.0);
					break;
				}
			}
		}
	}
	if(clr.x > .5)
		gl_FragColor = vec4(outClr, 1.0);
	else
		gl_FragColor = vec4(.8,.8,.8,1.0);
}
