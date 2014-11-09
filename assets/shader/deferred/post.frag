precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
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
  vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
  vec3 normal = texture2D( u_normalTex, v_texcoord).rgb;  
  vec3 color = texture2D( u_colorTex, v_texcoord).rgb; 
  vec3 position = texture2D( u_positionTex, v_texcoord).rgb; 
  float depth = texture2D(u_depthTex, v_texcoord).r;
  //depth = linearizeDepth( depth, u_zNear, u_zFar );
  vec2 v_TexcoordOffsetRight = v_texcoord + vec2(1.0/960.0, 0.0);
  float depthOffestRight = texture2D(u_depthTex, v_TexcoordOffsetRight).r;
  vec3 normalOffestRight = texture2D( u_normalTex, v_TexcoordOffsetRight).rgb;  
  float angleWithRight = dot(normal, normalOffestRight);
  
  
  vec2 v_TexcoordOffsetUp = v_texcoord + vec2(0.0, 1.0/540.0);
  float depthOffestUp = texture2D(u_depthTex, v_TexcoordOffsetUp).r;
  vec3 normalOffestUp = texture2D( u_normalTex, v_TexcoordOffsetUp).rgb; 
  float angleWithUp = dot(normal, normalOffestUp);
  
  //float test = float(int(shade.r / 0.1));
  float toonShadingR = 0.1 * float(int(shade.r / 0.1));
  
  float toonShadingG = 0.1 * float(int(shade.g / 0.1));
  float toonShadingB = 0.1 * float(int(shade.b / 0.1));
  vec3 toonShading = vec3(toonShadingR, toonShadingG, toonShadingB);

  gl_FragColor = vec4(shade, 1.0);
   /* if (u_displayType == 0){
		if(color.x != 1.0){
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
	    }
		else
			gl_FragColor = vec4(shade, 1.0); 
	}
	else if(u_displayType == 9){
		//if(angleWithRight < 1.0 || angleWithUp< 1.0)
		if(abs(depth - depthOffestRight) > 0.05 || abs(depth - depthOffestUp) > 0.05)
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		else
			gl_FragColor = vec4(toonShading, 1.0); 	
	}*/
  /*
  if(abs(depth - depthOffestRight) > 0.05 || abs(depth - depthOffestUp) > 0.05)
  //if(angleWithRight<1.0 || angleWithUp<1.0)
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); 
  else if(color.x != 1.0){
   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
  }
  else{
    if (u_displayType == 0)
		gl_FragColor = vec4(shade, 1.0); 
	else if(u_displayType == 9)
		gl_FragColor = vec4(toonShading, 1.0); 
  }*/
  
  
}
