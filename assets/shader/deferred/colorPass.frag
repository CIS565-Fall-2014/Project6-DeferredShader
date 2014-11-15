precision highp float;

uniform sampler2D u_sampler;

varying float v_normalY;

void main(void){
	gl_FragColor = vec4(0.7, 0.7, 0.7, v_normalY);
}
