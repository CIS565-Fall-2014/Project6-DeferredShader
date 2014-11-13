precision highp float;

attribute vec3 a_pos;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main(void){
    v_texcoord = a_texcoord;
    gl_Position = vec4( a_pos, 1.0 );
}
