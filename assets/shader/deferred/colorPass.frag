precision highp float;

uniform sampler2D u_sampler;
varying vec2 v_texcoord;
uniform vec3 u_diffuseColor;

void main(void){
	gl_FragColor = vec4(u_diffuseColor,1.0);
	//gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
	//gl_FragColor = texture2D( u_colorTex, v_texcoord );
}
