precision highp float;

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

uniform float u_width;
uniform float u_height;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void tiles(){
	float binSize = 10.0;
  
	float pixelX = v_texcoord.x*u_width;
	float pixelY = v_texcoord.y*u_height;
	
	float binnedPixelX = floor(pixelX/binSize);
	float binnedPixelY = floor(pixelY/binSize);

	float newTexelCoordX = binnedPixelX/u_width*binSize;
	float newTexelCoordY = binnedPixelY/u_height*binSize;
  
	vec2 newTexCoord = vec2(newTexelCoordX, newTexelCoordY);
	
	vec3 color = texture2D(u_shadeTex, newTexCoord).rgb;
	gl_FragColor = vec4(color, 1.0);
}

float gaussian(float x, float sigma){
	return 1.0/sqrt(2.0*3.15159265359*sigma*sigma)*exp(-x*x/(2.0*sigma*sigma));
}

vec3 blurColor(){
	vec3 color;
	for (int i=-10; i<10; i+=1){
		for (int j=-10; j<10; j+=1){
			vec2 offset = v_texcoord + vec2(1.0/float(u_width)*float(i), 1.0/float(u_height)*float(j));
			color += texture2D(u_shadeTex, offset).rgb * gaussian(offset.x, 15.0) * gaussian(offset.y, 15.0);
		}
	}
	return color;
}

void bloom(){
	vec4 blur = vec4(blurColor(), 1.0);
	gl_FragColor += blur*5.0;
}


void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
	gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
  
	//tiles();
	//bloom();
  
  //gl_FragColor = vec4(0,1,0,1);
}
