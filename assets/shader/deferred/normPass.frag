precision highp float;

varying vec3 v_normal;
varying float v_depth;

void main(void){
	gl_FragColor = vec4(normalize(v_normal), 1.0);
}
