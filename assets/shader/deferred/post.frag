precision highp float;

uniform sampler2D u_shadeTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType; //keys input
uniform mat4 u_modelview;

varying vec2 v_texcoord;

#define Toon_Shading_Basic 1
#define Toon_Shading 2
#define Bloom_Shading 3
#define Screen_Space_Ambient_Occlusion 4
#define Blinn_Phong_Shading 5

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0);

   vec2 fixed_coord = v_texcoord;
   fixed_coord.x = 1.0-fixed_coord.x;
   vec3 this_color = texture2D( u_shadeTex, fixed_coord).rgb; //from diffuse.frag color result

   vec4 finalcolor = vec4(this_color, 1.0);

   gl_FragColor = finalcolor;
}
