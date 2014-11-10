precision highp float;

uniform sampler2D u_shadeTex;
//uniform sampler2D u_bloomTex;
uniform float u_kernel[25];    //5*5 kernel
uniform float u_offset;     //texture coord offset
uniform int u_displayType;


varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
	  // Currently acts as a pass filter that immmediately renders the shaded texture
	  // Fill in post-processing as necessary HERE
	  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
	  
	  if(u_displayType==1 || u_displayType == 5 || u_displayType ==6){
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
	  }
	  else if (u_displayType == 7){
	  
			float d = 0.1;
			float left = v_texcoord.s - u_offset * 2.0;
			float top = v_texcoord.t - u_offset *2.0;
			vec2 tc = vec2(left, top);
			vec4 c = vec4(0, 0, 0, 0);
			
			for(int i=0; i<5; i++){
				for(int j=0; j<5; j++){
						c += u_kernel[ i*5+j ] * texture2D(u_shadeTex, tc); 
						if(j == 4 ){
							tc.y += u_offset;
							tc.x = left;
						}
						else{
							tc.x += u_offset;
						}
				}
			}

		/*	c += coefficients[ 0] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 1] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 2] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 3] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 4] * texture2D(source, tc); tc.y += u_offset;
			tc.x = left;
			c += coefficients[ 5] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 6] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 7] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 8] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[ 9] * texture2D(source, tc); tc.y += u_offset;
			tc.x = left;
			c += coefficients[10] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[11] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[12] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[13] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[14] * texture2D(source, tc); tc.y += u_offset;
			tc.x = left;
			c += coefficients[15] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[16] * texture2D(source, tc); tc.x += u_offset;
			c += coefficients[17] * texture2D(source, tc); tc.x += offset;
			c += coefficients[18] * texture2D(source, tc); tc.x += offset;
			c += coefficients[19] * texture2D(source, tc); tc.y += offset;
			tc.x = left;
			c += coefficients[20] * texture2D(source, tc); tc.x += offset;
			c += coefficients[21] * texture2D(source, tc); tc.x += offset;
			c += coefficients[22] * texture2D(source, tc); tc.x += offset;
			c += coefficients[23] * texture2D(source, tc); tc.x += offset;
			c += coefficients[24] * texture2D(source, tc);*/

			gl_FragColor = c;
	  }
  
	

}
