precision highp float;

uniform mat4 u_persp;
uniform mat4 u_modelView;

attribute vec3 v_position;
attribute vec3 v_normal;

varying vec3 fs_normal;

void main (void) {
  fs_normal = v_normal;
  gl_Position = u_persp * u_modelView * vec4(v_position, 1.0);
}
