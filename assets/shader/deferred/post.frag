precision highp float;
#define DISPLAY_TOON 5
#define DISPLAY_BLOOM 6

#define KERNEL_SIZE 21

uniform sampler2D u_shadeTex;

varying vec2 v_texcoord;

//Added
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;
uniform float u_ScreenWidth;
uniform float u_ScreenHeight;


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}


float gaussian2d(int x,int y,int n) {
    float sigma = 2.0;
    float fx = float(x) - (float(n) - 1.0) / 2.0;
    float fy = float(y) - (float(n) - 1.0) / 2.0;
	return (exp(-abs(fx*fy)/ (2.0*sigma*sigma)))/ (2.0 * 3.1415926 *sigma*sigma);
}

float gaussian1d(int i, float width) {
	return exp(-abs(float(i))/width);
}

vec4 bloomShader() {
    float offsetw =  1.0 / u_ScreenWidth;
	float offseth =  1.0 / u_ScreenHeight;
	float width = (float(KERNEL_SIZE) - 1.0) / 2.0;
    vec3 c = vec3(0.0, 0.0, 0.0);
	
	for(int i=0; i< KERNEL_SIZE; i++){
			for(int j=0; j< KERNEL_SIZE; j++){
			    vec2 tc = v_texcoord;
				tc.y += (float(i)-width)*offseth;
				tc.x += (float(j)-width)*offsetw;
				c += gaussian2d(i,j,KERNEL_SIZE) * texture2D(u_colorTex, tc).rgb;			
			}
		}

	return vec4(c,1.0);
}

void main()
{
   vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;
   if (u_displayType == DISPLAY_BLOOM)
      gl_FragColor = bloomShader();
   else
      gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}


