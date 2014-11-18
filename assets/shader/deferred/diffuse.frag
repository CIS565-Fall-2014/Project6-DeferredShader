precision highp float;

#define TYPE_TOON 5
#define TYPE_DIFFUSE 0

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

//added 
uniform mat4 u_View;
uniform vec3 u_lightpos;
uniform vec3 u_lightcolor;
uniform vec3 u_eyepos;
uniform float screenHeight;
uniform float screenWidth;
///////////////

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
	vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
  	vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
	vec4 color = texture2D( u_colorTex, v_texcoord );
	float depth = texture2D( u_depthTex, v_texcoord ).x;
	depth = linearizeDepth(depth, u_zNear, u_zFar);
	vec3 lightpos = vec3 (u_View * vec4(vec3(0.0, 15.0, 15.0), 1.0 ));

	vec3 outColor = vec3(0.1, 0.2, 0.4);
	vec3 L = normalize(lightpos - position);
	vec3 N = normalize(normal);
	vec3 E = normalize(vec3(0.0) - position);
	vec3 H = normalize(E + L);
	if(depth < 0.9)
	{
		if(u_displayType == TYPE_TOON)
		{
			vec3 toonColor_h = texture2D(u_colorTex, v_texcoord).rgb;
			vec3 toonColor_m = toonColor_h * 0.5;
			vec3 toonColor_l = toonColor_m * 0.5;

			float dot = clamp(dot(N,L),0.0,1.0);
			if(dot > 0.8)
			{
				outColor = toonColor_h;
			}	
			else if(dot > 0.4)
			{
				outColor = toonColor_m;
			}
			else
			{
				outColor = toonColor_l;
			}	
			//draw silhouette
			float maxDepth = 0.0;
			for(int i= -3; i <=3; i++)
			{
				float offsetY = clamp(float(i) / screenHeight + v_texcoord.y, 0.0, 1.0);
				for(int j= -3; j <=3; j++)
				{
					float offsetX = clamp(float(j)/ screenWidth + v_texcoord.x, 0.0, 1.0);
					float other_depth = texture2D( u_depthTex, vec2(offsetX, offsetY)).x;
					other_depth = linearizeDepth(other_depth, u_zNear, u_zFar);
					if(other_depth > maxDepth)
						maxDepth = other_depth;
				}
			}
			if(maxDepth - depth > 0.01)
				outColor = vec3(0.0);
		}
		else if(u_displayType == TYPE_DIFFUSE)
		{
			//blinn-phong
			float shininess = 50.0;
			float diffuse = clamp(dot(N,L),0.0,1.0);
			float specular = pow(max(dot(N,H),0.0),shininess);
	
			outColor = u_lightcolor * diffuse * texture2D(u_colorTex, v_texcoord).rgb + u_lightcolor * specular;
		}
	}
	gl_FragColor = vec4(outColor, 1.0);

}
