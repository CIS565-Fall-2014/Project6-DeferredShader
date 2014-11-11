precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_modelview;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
   //lights
   vec3 lightPos = vec3(0.0,8.0,5.0);
   lightPos = (u_modelview * vec4(lightPos,1.0)).xyz;
   vec3 lightCol = vec3(1.0,1.0,1.0);
   
   vec3 vPos = texture2D(u_positionTex,v_texcoord).rgb;
   vec3 vNormal = normalize(texture2D(u_normalTex,v_texcoord).rgb);
   vec3 L = normalize(lightPos - vPos);
   vec3 R = reflect(-L,vNormal);
   vec3 V = vec3(0.0,0.0,-1.0);
   
   float diffuse = clamp(dot(L,vNormal),0.0,1.0);
   float specular = pow(clamp(dot(-V,R),0.0,1.0),8.0);

   vec3 finalColor =  0.8 * diffuse *texture2D(u_colorTex, v_texcoord).rgb * lightCol + 0.2 * specular * lightCol;

   gl_FragColor = vec4(finalColor, 1.0);
}
