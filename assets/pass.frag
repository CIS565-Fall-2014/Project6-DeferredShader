precision highp float;

uniform sampler2D u_texture;

varying vec2 fs_texcoord;

void main(void) {
  float color = texture2D(u_texture, fs_texcoord).x;
  gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}
