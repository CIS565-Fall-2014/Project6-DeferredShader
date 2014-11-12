precision highp float;

varying vec4 v_pos;
varying float v_depth;

void main(void){
	gl_FragColor = v_pos;
}
