precision highp float;

attribute vec3 v_position;
attribute vec2 v_texcoord;

varying vec2 fs_texcoord;

void main (void) {
  fs_texcoord = v_texcoord;
  gl_Position = vec4(v_position, 1.0); 
}
