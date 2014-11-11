precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_postTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform int u_displayType;


varying vec2 v_texcoord;



void main()
{

	vec3 post = texture2D( u_postTex, v_texcoord).rgb;
	vec3 normal = texture2D( u_normalTex, v_texcoord).rgb;  
	vec3 color = texture2D( u_colorTex, v_texcoord).rgb; 
	vec3 position = texture2D( u_positionTex, v_texcoord).rgb; 

	
	if(u_displayType == 7){
		float value = 0.0;
		for(int i = 0; i < 11; ++i){
			vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 5)/960.0, 0.0)).rgb; 
			if(bloomExam.x != 0.0){
				value += bloomExam.x * (6.0 - abs(5.0 - float(i)));
			}
			gl_FragColor = vec4(vec3(float(value) / 36.0, float(value) / 36.0, float(value) / 36.0), 1.0);
		}
	
	}
	else
		gl_FragColor = vec4(post, 1.0); 


	

  
}
