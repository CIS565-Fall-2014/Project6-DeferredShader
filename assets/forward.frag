precision highp float;

varying vec3 fs_normal;

void main (void) {
  // Using directional light
  vec3 dirLight = vec3(0.5, 0.5, 0.5);

  gl_FragColor = vec4(vec3(dot(dirLight, fs_normal)), 1.0);

  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
