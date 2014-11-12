precision highp float;

attribute vec3 a_pos;

uniform mat4 u_modelview;
uniform mat4 u_mvp;

varying vec4 v_pos;
varying float v_depth;

void main(void){
	gl_Position = u_mvp * vec4( a_pos, 1.0 );
  v_pos = u_modelview * vec4( a_pos, 1.0 );
  v_depth = ( gl_Position.z / gl_Position.w + 1.0 )  / 2.0;
}
