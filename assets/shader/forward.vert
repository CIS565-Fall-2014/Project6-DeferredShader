precision highp float;

uniform mat4 u_persp;
uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec3 a_normal;

varying vec3 fs_normal;

void main (void) {
  fs_normal = a_normal;
  gl_Position = u_persp * u_modelView * vec4(a_position, 1.0);
}
