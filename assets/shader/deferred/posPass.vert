precision highp float;

attribute vec3 a_pos;
attribute vec3 a_normal;

uniform mat4 u_modelview;
uniform mat4 u_mvp;
uniform mat4 u_normalMat;

varying vec4 v_pos;

void main(void){
	gl_Position = u_mvp * vec4( a_pos, 1.0 );
  v_pos = u_modelview * vec4( a_pos, 1.0 );
  v_pos.w = (u_normalMat * vec4(a_normal,0.0)).x; //appends the normal's x to position.
}
