precision highp float;

varying vec3 v_normal;

void main(void){
	gl_FragColor = vec4(abs(v_normal), 1.0);
}
