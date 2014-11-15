precision highp float;

attribute vec3 a_pos;
attribute vec3 a_normal;

uniform mat4 u_mvp;
uniform mat4 u_normalMat;

varying float v_normalY;

void main(void){
	gl_Position = u_mvp * vec4( a_pos, 1.0 );
  v_normalY = ( u_normalMat * vec4(a_normal,0.0) ).y;
}
