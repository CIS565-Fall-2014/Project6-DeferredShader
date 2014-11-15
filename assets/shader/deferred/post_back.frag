precision highp float;
#define DIFFUSE 	5
#define BLOOM 		6
#define TOON 		7
#define SSAO 		8
#define ALL			9



#define SIZE 	31
#define SAMPLER_SIZE 80 
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;




uniform float u_rad;
uniform vec3 u_sampler[80];

float gaussian(int x,int y,int n) {
    float sigma = 2.0;
    float fx = float(x) - (float(n) - 1.0) / 2.0;
    float fy = float(y) - (float(n) - 1.0) / 2.0;
	return (exp(-abs(fx*fy)/ (2.0*sigma*sigma)))/ (2.0 * 3.1415926 *sigma*sigma);
}


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec4 Bloom(){
	float x=1.0/1024.0;
	float y=1.0/512.0;
	
	float wid=(float(SIZE)-1.0)/2.0;
	vec3 cc=vec3(0.0);

	for(int i=0;i<SIZE;i++){
		for( int j=0;j<SIZE;j++){
			vec2 tex=v_texcoord;
			tex.y+=(float(i)-wid)*y;
			tex.x+=(float(j)-wid)*x;
			cc+=gaussian(i,j,SIZE)*texture2D(u_shadeTex,tex).rgb;
		}
	}

	return vec4(cc,1.0); 
}

vec4 Toon(){
	return vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}


float rand(float co){
    return fract(sin(dot(vec2(co,co) ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 Ssao(){
	//vec3 clr = texture2D( u_colorTex, v_texcoord ).xyz;
	vec3 nml = texture2D( u_normalTex, v_texcoord ).xyz;
	vec3 pos = texture2D(u_positionTex, v_texcoord).xyz;
	float dp = texture2D(u_depthTex, v_texcoord).r;
	dp = linearizeDepth( dp, u_zNear, u_zFar );
	float occ=0.0;
	vec3 ori=vec3(pos.x,pos.y,dp);
	
	for(int i=0;i<SAMPLER_SIZE;i++){
		vec3 rvec=normalize(u_sampler[i]);
		vec3 tangent=normalize(rvec-nml*dot(rvec,nml));
		vec3 bitangent=cross(nml,tangent);
		mat3 tbn=mat3(tangent,bitangent,nml);
		
		vec3 kvec=vec3(rand(pos.x),rand(pos.y),(rand(pos.z)+1.0)/2.0);
		kvec=normalize(kvec);
		float scale=float(i)/float(SAMPLER_SIZE);
		scale=mix(0.1,1.0,scale*scale);
		kvec=kvec*scale;
		
		vec3 sample=tbn*kvec;
		float sdp=texture2D(u_depthTex,v_texcoord+vec2(sample.x,sample.y)*u_rad).r;
		sdp=linearizeDepth(sdp,u_zNear,u_zFar);
		
		float sz=ori.z-(sample*u_rad).z/2.0;
		
		float range=abs(ori.z-sdp)<u_rad?1.0:0.0;
		
		if(sdp<=sz) occ+=range;
	}
	occ=1.0-occ/float(SAMPLER_SIZE);
	return vec4(vec3(occ), 1.0); 
}


void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
	if(u_displayType==DIFFUSE)
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
	else if(u_displayType==BLOOM){
		gl_FragColor=Bloom();
	}
	else if(u_displayType==TOON){
		gl_FragColor=Toon();
	}
	else if(u_displayType==SSAO){
		gl_FragColor=Ssao();
	}
	else if(u_displayType==ALL){
		gl_FragColor=clamp(Bloom()+Toon()+Ssao(),0.0,1.0);
	}
}
