precision highp float;

uniform sampler2D u_colorTex;
uniform sampler2D u_shadeTex;
varying vec2 v_texcoord;
uniform int u_displayType;

void main()
{
	vec3 color = texture2D( u_colorTex, v_texcoord).rgb; 
	vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb; 
	

	float value = 0.0;

	
	/*for(int i = 0; i < 31; ++i){
		vec3 bloomExam = texture2D( u_colorTex, v_texcoord + vec2(0.0, float(i - 15)/540.0)).rgb; 
		if(bloomExam.x != 0.0){
			value += bloomExam.x * (16.0 - abs(15.0 - float(i)));
		}
	}
	gl_FragColor = vec4(shade + vec3(float(value) / 256.0, float(value) / 256.0, float(value) / 256.0), 1.0);*/

	for(int i = 0; i < 11; ++i){
		vec3 bloomExam = texture2D( u_colorTex, v_texcoord + vec2(0.0, float(i - 5)/540.0)).rgb; 
		if(bloomExam.x != 0.0){
			value += bloomExam.x * (6.0 - abs(5.0 - float(i)));
		}
	}
	gl_FragColor = vec4(shade + vec3(float(value) / 36.0, float(value) / 36.0, float(value) / 36.0), 1.0);
}
