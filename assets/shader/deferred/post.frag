precision highp float;

uniform sampler2D u_shadeTex;
//uniform sampler2D u_colorTex;
//uniform sampler2D u_bloomTex;
/*uniform sampler2D u_bloomTex0;
uniform sampler2D u_bloomTex1;
uniform sampler2D u_bloomTex2;
uniform sampler2D u_bloomTex3;*/

uniform float u_kernel[25];    //5*5 kernel
uniform float u_kernel2[441];    //21*21 kernel
uniform float u_offset;     //texture coord offset in width
uniform float u_offset2;   //texture coord offset in height
uniform int u_displayType;


varying vec2 v_texcoord;

float planeDistance(vec3 positionA, vec3 normalA, 
                    vec3 positionB, vec3 normalB) {
  vec3 positionDelta = positionB - positionA;
  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));
  return planeDistanceDelta;
}



float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float lum(vec4 col) {
  return dot(col.xyz, vec3(0.3, 0.59, 0.11));
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
						tc.y += u_offset2;
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
						tc.y += u_offset2;
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
	  else if(u_displayType == 8){
		// smooth toon shader
		vec2 offset = vec2(u_offset, u_offset2);
		vec3 toon;
		float diffuse = texture2D(u_shadeTex, v_texcoord ).a;

		if (diffuse > 0.951)   //cos(18)
			toon = vec3(1.0,0.5,0.5);
		else if(diffuse > 0.809)   //cos(36)
			toon = vec3(0.8,0.4,0.4);
		else if (diffuse > 0.587)   //cos(54)
			toon = vec3(0.6,0.3,0.3);
		else if (diffuse > 0.309)    //cos(72)
			toon = vec3(0.4,0.2,0.2);
		else if (diffuse > 0.01)    //cos(90)
			toon = vec3(0.2,0.1,0.1);
	
		//obtain surrounding illumination
		float t00 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2(-1, -1)));
		float t10 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2( 0, -1)));
		float t20 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2( 1, -1)));
		float t01 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2(-1,  0)));
		float t21 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2( 1,  0)));
		float t02 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2(-1,  1)));
		float t12 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2( 0,  1)));
		float t22 = lum(texture2D(u_shadeTex, v_texcoord + offset * vec2( 1,  1)));
		vec2 grad;
		grad.x = t00 + 2.0*t01 + t02 - t20 - 2.0*t21 - t22;
		grad.y = t00 + 2.0*t10 + t20 - t02 - 2.0*t12 - t22;
		float len = length(grad);
		vec3 edge = vec3(len,len,len);
		gl_FragColor = vec4(toon + edge, 1.0);

		
	  }
  
	

}
