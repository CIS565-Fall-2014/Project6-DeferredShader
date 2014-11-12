precision highp float;

attribute vec3 a_pos;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

void main(void){
   // v_texcoord = a_texcoord;
   v_texcoord = vec2(1.0 - a_texcoord.x, a_texcoord.y);
    gl_Position = vec4( a_pos, 1.0 );
}
