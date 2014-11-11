precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_postTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;



varying vec2 v_texcoord;



void main()
{

	vec3 post = texture2D( u_postTex, v_texcoord).rgb;
	vec3 normal = texture2D( u_normalTex, v_texcoord).rgb;  
	vec3 color = texture2D( u_colorTex, v_texcoord).rgb; 
	vec3 position = texture2D( u_positionTex, v_texcoord).rgb; 

	


		//if(color.x != 1.0){
		//	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
	    //}
		//else
			gl_FragColor = vec4(post, 1.0); 
	

  
}
