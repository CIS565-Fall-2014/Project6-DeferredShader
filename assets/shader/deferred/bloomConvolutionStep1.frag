precision highp float;


uniform sampler2D u_postTex;
uniform sampler2D u_shadeTex;
varying vec2 v_texcoord;
uniform int u_displayType;

void main()
{
	vec3 post = texture2D( u_postTex, v_texcoord).rgb; 



	float value = 0.0;
	
	for(int i = 0; i < 31; ++i){
		vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 15)/960.0, 0.0)).rgb; 
		if(bloomExam.x != 0.0){
			value += bloomExam.x * (16.0 - abs(15.0 - float(i)));
		}
	}
	gl_FragColor = vec4(vec3(float(value) / 256.0, float(value) / 256.0, float(value) / 256.0), 1.0);

}
