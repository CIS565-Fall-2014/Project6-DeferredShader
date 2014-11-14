#extension GL_EXT_draw_buffers: require
precision highp float;

uniform sampler2D u_sampler;

varying vec4 v_pos;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying float v_depth;

void main(void){
    vec3 n = normalize(v_normal);
	gl_FragData[0] = vec4( v_depth, 0, 0, 0 );
	gl_FragData[1] = vec4( v_pos.xyz, n.x );
	gl_FragData[2] = vec4( 0.9, 0.9, 0.9, n.y );
	//gl_FragData[3] = vec4( normalize(v_normal), 1.0 );
}
