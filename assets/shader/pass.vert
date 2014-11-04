precision highp float;

attribute v_position;
attribute v_texcoord;

varying fs_texcoord;

void main (void) {
  fs_texcoord = v_texcoord;
  gl_Position = vec4(v_position, 1.0); 
}
