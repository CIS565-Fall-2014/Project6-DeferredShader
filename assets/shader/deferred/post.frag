precision highp float;


#define DISPLAY_BLINN 5
#define DISPLAY_BLOOM 6
#define DISPLAY_TOON 7
#define DISPLAY_AO 8
#define DISPLAY_PIXEL 9
#define DISPLAY_GLASS 0

#define KERNEL_SIZE 19
#define AO_KERNEL_SIZE 128

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

//ra
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform int u_displayType;
uniform float u_zFar;
uniform float u_zNear;

uniform float u_pixWidth;
uniform float u_pixHeight;

uniform mat4 u_mvp; //modelview
uniform vec3 u_eye;

vec2 poisson[AO_KERNEL_SIZE];    // These are the Poisson Disk Samples


                               

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec3 myNormalize(vec3 norm)
{
	float normlength = length(norm);
	if(normlength < 0.0001) normlength = 0.0001;
	return norm/normlength;
}

float getKernelValue(float tmp_x, float tmp_y)
{
	tmp_x = abs(tmp_x);
	tmp_y = abs(tmp_y);
	float seed = 1.0;
	float tmp = exp(- tmp_x*tmp_x*tmp_y*tmp_y) / (2.0* seed * seed);
	return tmp/(2.0 * 3.14159 *seed *seed);
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 spline(float x, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9)
{
  float w1, w2, w3, w4, w5, w6, w7, w8, w9;
  w1 = 0.0;  w2 = 0.0;  w3 = 0.0;
  w4 = 0.0;  w5 = 0.0;  w6 = 0.0;
  w7 = 0.0;  w8 = 0.0;  w9 = 0.0;
  float tmp = x * 8.0;
  if (tmp<=1.0) {
    w1 = 1.0 - tmp;
    w2 = tmp;
  }
  else if (tmp<=2.0) {
    tmp = tmp - 1.0;
    w2 = 1.0 - tmp;
    w3 = tmp;
  }
  else if (tmp<=3.0) {
    tmp = tmp - 2.0;
    w3 = 1.0-tmp;
    w4 = tmp;
  }
  else if (tmp<=4.0) {
    tmp = tmp - 3.0;
    w4 = 1.0-tmp;
    w5 = tmp;
  }
  else if (tmp<=5.0) {
    tmp = tmp - 4.0;
    w5 = 1.0-tmp;
    w6 = tmp;
  }
  else if (tmp<=6.0) {
    tmp = tmp - 5.0;
    w6 = 1.0-tmp;
    w7 = tmp;
  }
  else if (tmp<=7.0) {
    tmp = tmp - 6.0;
    w7 = 1.0 - tmp;
    w8 = tmp;
  }
  else 
  {
    // http://www.ozone3d.net/blogs/lab/20080709/saturate-function-in-glsl/
    tmp = clamp(tmp - 7.0, 0.0, 1.0);
    w8 = 1.0-tmp;
    w9 = tmp;
  }
  return w1*c1 + w2*c2 + w3*c3 + w4*c4 + w5*c5 + w6*c6 + w7*c7 + w8*c8 + w9*c9;
}

float intensity(vec4 color)
{
	return sqrt((color.x*color.x)+(color.y*color.y)+(color.z*color.z));
}

bool isEdge(vec2 texcoord)
{
	float center_intensity = intensity(texture2D(u_shadeTex, texcoord));
	int darker_count = 0;
	float max_intensity = center_intensity;

	float radius = 5.0;

	for (int i = -5; i <= 5; i++)
	{
		for (int j = -5; j <= 5; j++)
		{
			vec2 current_location = texcoord + vec2( float(i)*u_pixWidth, float(j)*u_pixHeight);
			float current_intensity = intensity(texture2D(u_shadeTex,current_location));
			if(current_intensity < center_intensity){
				darker_count++;
			} 	
			if(current_intensity > max_intensity)
			{
				max_intensity = current_intensity;
			}
		}
	}
	if((max_intensity - center_intensity) > 0.01*radius)
	{
		if(float(darker_count)/(radius*radius) < (1.0-(1.0/radius)))
		{
			return true;
		}
	}
	return false;
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  
  vec3 myPos = texture2D(u_positionTex,v_texcoord).rgb;
  vec3 myNorm = texture2D(u_normalTex,v_texcoord).rgb;
  myNorm = myNormalize(myNorm);
  float myDepth = texture2D(u_depthTex, v_texcoord).r;
  myDepth = linearizeDepth( myDepth, u_zNear, u_zFar );

  if(u_displayType == DISPLAY_BLOOM)
  {
  //float kernel[KERNEL_SIZE * KERNEL_SIZE];
 
  //process the kernel value to be percentage
  //	float sum = 0.0;
  //  for (int c = 0; c < KERNEL_SIZE * KERNEL_SIZE; c++)
  //      sum += kernel[c];
  //  for (int c = 0; c < KERNEL_SIZE * KERNEL_SIZE; c++)
    //    kernel[c] /= sum;

    vec3 colorSum = vec3(0.0,0.0,0.0);

    float kernel_radius = (float(KERNEL_SIZE) - 1.0)/2.0;
	

    for(int j = 0; j < KERNEL_SIZE; j++){
		for(int i = 0; i < KERNEL_SIZE; i++){
			vec2 tc = v_texcoord;

			float tmp_x = float(i) - kernel_radius;
			float tmp_y = float(j) - kernel_radius;
			
			tc.x += tmp_x * u_pixWidth;
			tc.y += tmp_y * u_pixHeight;

			float k = getKernelValue(tmp_x, tmp_y);

			//colorSum +=  kernel[KERNEL_SIZE*j+i] * texture2D(u_shadeTex, tc).rgb;
			colorSum +=  k * texture2D(u_shadeTex, tc).rgb;
  		}
	}
	gl_FragColor = vec4(colorSum,1.0);

	

  }
  else if(u_displayType == DISPLAY_TOON)
{

	bool isBack = false;
	vec3 lightpos = vec3(0.0, 5.0, 2.0);
   	lightpos = (u_mvp * vec4(lightpos,1.0)).xyz;
   	vec3 lightcolor = vec3(1.0,1.0,1.0);

	vec3 basicColor = vec3(0.5,0.9,1.0);
	vec3 specColor = vec3(1.0,1.0,0.8);

	float factor = 1.0;// diffucse color factor
	float spec = 0.0; //specular color factor	

	vec3 lightDir = myNormalize( lightpos - myPos );
	vec3 viewDir= myNormalize( u_eye - myPos );
	float NdotL = dot(lightDir, myNorm);
	NdotL = (NdotL > 0.0) ? NdotL : 0.0;
	vec3 H = myNormalize( lightDir + viewDir);
		  
	float NdotH = dot( myNorm, H);
	NdotH = ( NdotH > 0.0) ? NdotH : 0.0;
	float intensity = pow(NdotH, 20.0);
	
	if (NdotL > 0.3) factor = 1.0;
	//else if (NdotL > 0.5) factor = 0.7;
	//else if (NdotL > 0.4) factor = 0.5;
	else factor = 0.5;

	if(intensity > 0.4) {spec = 1.0;factor = 0.0;}
	
	if(isEdge(v_texcoord))
	{
	//outline
		gl_FragColor = vec4(0.0,0.0,0.0,1.0);
	}else if(myDepth < 1.0){
		gl_FragColor = vec4(basicColor * lightcolor * factor + spec * specColor, 1.0); 
	}else gl_FragColor = vec4(0.3,0.3,0.3,1.0);
}
else if(u_displayType == DISPLAY_AO){
 		
	

	vec3 viewPos = vec3(myPos.x, myPos.y, myDepth);

	for(int i = 0; i < AO_KERNEL_SIZE; ++i)
	{
		poisson[i] = vec2(rand(vec2(myPos.x, myPos.y)), rand(vec2(myPos.x, myPos.y)));
		float scale = float(i) / float(AO_KERNEL_SIZE);
   		scale = linearizeDepth(scale * scale, 0.1, 1.0);
  		poisson[i] *= scale;
	}

	float ao = 0.0;
	vec2 radius = vec2(0.1,0.1);

		for (int i = 0; i < AO_KERNEL_SIZE; ++i)
  		{
	        // sample
	        vec2 sampleTexCoord = v_texcoord + (poisson[i] * radius);
	        float sampleDepth = texture2D(u_depthTex, sampleTexCoord).r;
	        sampleDepth = linearizeDepth( sampleDepth, u_zNear, u_zFar );
	        vec3 samplePos = texture2D(u_positionTex, sampleTexCoord).rgb;
	        vec3 sampleViewPos = vec3(samplePos.x, samplePos.y, sampleDepth);
	        vec3 sampleDir = myNormalize(sampleViewPos - viewPos);
	 
	        // angle between SURFACE-NORMAL and SAMPLE-DIRECTION
	        float NdotS = dot(myNorm, sampleDir);
	        //NdotS = ( NdotS < 0.0) ? NdotS : 0.0;

	        // distance between SURFACE-POSITION and SAMPLE-POSITION
	        vec3 VPdistSP_v = viewPos - sampleViewPos;
	        float VPdistSP = sqrt(VPdistSP_v.x * VPdistSP_v.x + VPdistSP_v.y * VPdistSP_v.y + VPdistSP_v.z * VPdistSP_v.z);
	 
	      
	        float a = 1.0 - VPdistSP;
	        float b = NdotS;
	 
	        ao += (a * b);
	       
 	    }
 
    float ao_color = 1.0 - (ao / float(AO_KERNEL_SIZE));
    gl_FragColor = vec4(ao_color, ao_color, ao_color, 1.0) ;
   // gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb * ao_color, 1.0);
  } 
  else if(u_displayType == DISPLAY_PIXEL){

  	vec2 myCoord = v_texcoord;
  	int tileSize = 6;

  	float dx = u_pixWidth * float(tileSize);
    float dy = u_pixHeight * float(tileSize);
    vec2 pixCoord = vec2(dx*floor(myCoord.x/dx), dy*floor(myCoord.y/dy));
    vec3 pixColor = texture2D(u_shadeTex, pixCoord).rgb;
    gl_FragColor = vec4(pixColor, 1.0);
  }
  else if(u_displayType == DISPLAY_GLASS)
  {
  	vec2 uv = v_texcoord;
  	int tileSize = 4;

  	float dx = u_pixWidth * float(tileSize);
    float dy = u_pixHeight * float(tileSize);

    vec2 ox = vec2(dx,0.0);
    vec2 oy = vec2(0.0,dy);

    vec2 PP = uv - oy;
    vec4 C00 = texture2D(u_shadeTex,PP - ox);
    vec4 C01 = texture2D(u_shadeTex,PP);
    vec4 C02 = texture2D(u_shadeTex,PP + ox);
    PP = uv;
    vec4 C10 = texture2D(u_shadeTex,PP - ox);
    vec4 C11 = texture2D(u_shadeTex,PP);
    vec4 C12 = texture2D(u_shadeTex,PP + ox);
    PP = uv + oy;
    vec4 C20 = texture2D(u_shadeTex,PP - ox);
    vec4 C21 = texture2D(u_shadeTex,PP);
    vec4 C22 = texture2D(u_shadeTex,PP + ox);
    
    float n = rand(0.115*uv);
   // n = mod(n, 0.111111)/0.111111;
    vec4 result = spline(n,C00,C01,C02,C10,C11,C12,C20,C21,C22);
    gl_FragColor = vec4(result.rgb,1.0);
  }
  else{
  	gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0);
  }   
}
