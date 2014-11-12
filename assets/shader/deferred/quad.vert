precision highp float;

attribute vec3 a_pos;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_mvp;
uniform mat4 u_normalMat;

varying vec3 v_normal;
varying vec2 v_texcoord;

void main(void){
    v_texcoord = vec2(1.0-a_texcoord.x, a_texcoord.y );
    gl_Position = vec4( a_pos, 1.0 );
}