precision highp float;

#define DISPLAY_BLOOM 5
#define DISPLAY_BLOOM2 6
#define DISPLAY_TOON 7
#define DISPLAY_AMBIENT 8

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;

varying vec2 v_texcoord;

uniform int u_displayType;

uniform int u_width;
uniform int u_height;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  
	if (u_displayType == DISPLAY_TOON)
	{
		vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;
		vec4 lineColor = vec4(0,0,0,1);
		float lineThick = 0.3;
		
		
		gl_FragColor = vec4(color, 1.0); 
	}
	else if( u_displayType == DISPLAY_BLOOM )
	{
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 color = vec3(0,0,0);
		int count = 0;
		for (int i = -10; i< 10; i++)
		{
			for (int j = -10; j < 10; j++)	
			{
				
				float dx = float(i) / float(u_width);
				float dy = float(j) / float(u_height);
				vec3 n = texture2D(u_normalTex, v_texcoord + vec2(dx, dy)).rgb;
				if (n.z > 0.2)
				{
					color += texture2D( u_shadeTex, v_texcoord + vec2(dx, dy)).rgb;
					count++;
				}
			}
		}
		color = (count > 0) ? color / float(count) : color;
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb + 0.5*color, 1.0); 
	}
	else
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}