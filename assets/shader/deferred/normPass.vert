precision highp float;

attribute vec3 a_pos;
attribute vec3 a_normal;

uniform mat4 u_mvp;
uniform mat4 u_normalMat;

varying vec3 v_normal;
varying float v_depth;

void main(void){
	gl_Position = u_mvp * vec4( a_pos, 1.0 );
	v_normal = vec3( u_normalMat * vec4(a_normal, 0.0) );
	v_depth = ( gl_Position.z / gl_Position.w + 1.0 )  / 2.0;
}
