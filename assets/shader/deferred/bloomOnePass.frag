precision highp float;

uniform sampler2D u_postTex;
uniform sampler2D u_shadeTex;
varying vec2 v_texcoord;
uniform int u_displayType;

void main()
{
	float value = 0.0;

	for(int i = 0; i < 31; ++i){
		for(int j = 0; j < 31; ++j){
			vec3 bloomExam = texture2D( u_postTex, v_texcoord + vec2(float(i - 15)/960.0, float(j - 15)/540.0)).rgb; 
			if(bloomExam.x != 0.0){
				value += bloomExam.x * (16.0 - abs(15.0 - float(i))) * (16.0 - abs(15.0 - float(j)));
			}
		}
	}
	vec3 shade = texture2D( u_shadeTex, v_texcoord).rgb;
	gl_FragColor = vec4(shade + vec3(0.0, float(value) / 65536.0, 0.0), 1.0);
}
