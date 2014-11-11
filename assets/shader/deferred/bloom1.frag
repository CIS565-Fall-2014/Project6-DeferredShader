precision highp float;


uniform sampler2D u_postTex;
uniform sampler2D u_shadeTex;
varying vec2 v_texcoord;
uniform int u_displayType;

void main()
{
	vec3 post = texture2D( u_postTex, v_texcoord).rgb; 


	if(u_displayType == 7){
		float value = 0.0;
		/*for(int i = 0; i < 11; ++i){
			vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 5)/960.0, 0.0)).rgb; 
			if(bloomExam.x != 0.0){
				value += bloomExam.x * (6.0 - abs(5.0 - float(i)));
			}
		}
		gl_FragColor = vec4(vec3(float(value) / 36.0, float(value) / 36.0, float(value) / 36.0), 1.0);*/
		
		for(int i = 0; i < 31; ++i){
			vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 15)/960.0, 0.0)).rgb; 
			if(bloomExam.x != 0.0){
				value += bloomExam.x * (16.0 - abs(15.0 - float(i)));
			}
		}
		gl_FragColor = vec4(vec3(float(value) / 256.0, float(value) / 256.0, float(value) / 256.0), 1.0);
	}
	else{
		float value = 0.0;
		/*for(int i = 0; i < 11; ++i){
			for(int j = 0; j < 11; ++j){
				vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 5)/960.0, float(j - 5)/540.0)).rgb; 
				if(bloomExam.x != 0.0){
					value += bloomExam.x * (6.0 - abs(5.0 - float(i))) * (6.0 - abs(5.0 - float(j)));
				}
			}
		}
		vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
		gl_FragColor = vec4(shade + vec3(float(value) / 1296.0, float(value) / 1296.0, float(value) / 1296.0), 1.0);*/
/*
		for(int i = 0; i < 51; ++i){
			for(int j = 0; j < 51; ++j){
				vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 25)/960.0, float(j - 25)/540.0)).rgb; 
				if(bloomExam.x != 0.0){
					value += bloomExam.x * (26.0 - abs(25.0 - float(i))) * (26.0 - abs(25.0 - float(j)));
				}
			}
		}
		vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
		gl_FragColor = vec4(shade + vec3(0.0, float(value) / 456976.0, 0.0), 1.0);*/
		
	}
}
