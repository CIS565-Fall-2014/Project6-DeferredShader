precision highp float;

uniform sampler2D u_shadeTex;
//uniform sampler2D u_bloomTex;
/*uniform sampler2D u_bloomTex0;
uniform sampler2D u_bloomTex1;
uniform sampler2D u_bloomTex2;
uniform sampler2D u_bloomTex3;*/

uniform float u_kernel[25];    //5*5 kernel
uniform float u_kernel2[441];    //21*21 kernel
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
	  else if (u_displayType == 7){   //naive bloom
		float left = v_texcoord.s - u_offset * 2.0;
		float top = v_texcoord.t - u_offset *2.0;
		vec2 tc = vec2(left, top);
		vec3 c = vec3(0.0, 0.0, 0.0);
		//vec4 c = vec4(0.0, 0.0, 0.0, 0.0);
		
		//vec4 tmp = texture2D(u_shadeTex, v_texcoord);
		//if(tmp.a > 0.01){
			for(int i=0; i<5; i++){
				for(int j=0; j<5; j++){
					c += u_kernel[ i*5+j ] * texture2D(u_shadeTex, tc).rgb; 
					if( j == 4 ){
						tc.y += u_offset;
						tc.x = left;
					}
					else{
						tc.x += u_offset;
					}
				}
			}
					
			left = v_texcoord.s - u_offset * 10.0;
			top = v_texcoord.t - u_offset * 10.0;
			tc = vec2(left, top);

			for(int i=0; i<=20; i++){
				for(int j=0; j<=20; j++){
					c += u_kernel[ i*21+j ] * texture2D(u_shadeTex, tc).rgb; 
					if( j == 20 ){
						tc.y += u_offset;
						tc.x = left;
					}
					else{
						tc.x += u_offset;
					}
				}
			}
			gl_FragColor = vec4(c,1.0);
		//}
		//else{
		//	gl_FragColor = vec4(0.0,0.0,0.0,1.0);
		//}
		
		
	
	  }
  
	

}
