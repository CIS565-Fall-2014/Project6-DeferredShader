precision highp float;

attribute vec3 a_pos;

uniform mat4 u_mvp;

void main(void){
	gl_Position = u_mvp * vec4( a_pos, 1.0 );
}
