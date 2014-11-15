precision highp float;
#define DIFFUSE 	5
#define BLOOM 		6
#define TOON 		7
#define SSAO 		8
#define UNSHARP		9



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

//http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
vec4 Ssao() {
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

vec4 Unsharp() {
   float depth = texture2D(u_depthTex, v_texcoord).r;
   depth = 1.0 -linearizeDepth( depth, u_zNear, u_zFar );
   vec2 texelSize = vec2(1.0/960.0,1.0/540.0);
   vec3 result = vec3(0.0,0.0,0.0);

   const int uBlurSize = 10;
   int depB = int(float(uBlurSize) * depth);
   
   vec2 hlim = vec2(float(-uBlurSize) * 0.5 + 0.5);
	for (int i = 0; i < uBlurSize; ++i) {
		if(i<=depB) 
		{
			for (int j = 0; j < uBlurSize; ++j) {
				if(j<=depB)
				{
					vec2 offset = (hlim + vec2(float(i), float(j))) * texelSize;
					result += texture2D(u_shadeTex, v_texcoord + offset).rgb;
				}
			}
		}

	}
   vec3 clr=texture2D(u_shadeTex,v_texcoord).rgb;
   vec4 fResult = vec4(2.0*clr-result / float(uBlurSize * uBlurSize),1.0);
   return fResult;
}


void main()
{
   vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;

   if (u_displayType == BLOOM)
      gl_FragColor = Bloom();
   else if(u_displayType == SSAO)
      gl_FragColor = Ssao();
   else if(u_displayType == UNSHARP)
	  gl_FragColor =Unsharp();
   else
      gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}


