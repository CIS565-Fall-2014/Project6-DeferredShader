precision highp float;

#define DISPLAY_BLOOM2 6

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;

varying vec2 v_texcoord;

uniform int u_displayType;

uniform int u_width;
uniform int u_height;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float edgeDetect(vec2 texcoord)
{
	vec2 G = vec2(0,0);
	vec3 Gx = vec3(0,0,0);
	vec3 Gy = vec3(0,0,0);
	for (int i = -1; i <= 1; i++)
	{
		for (int j = -1; j <= 1; j++)
		{
			vec3 c = texture2D(u_shadeTex, texcoord + vec2( float(i)/float(u_width), float(j)/float(u_height))).rgb;
			Gx += float((i == 0) ? j + j : j) * c;
			Gy += float((j == 0) ? -i - i : -i) * c;
		}
	}
	return sqrt(dot(Gx, Gx) + dot(Gy, Gy));
}

void main()
{
	if (u_displayType == DISPLAY_BLOOM2)
	{
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 color = vec3(0,0,0);
		float weight = 0.0;
		for (int j = -5; j<= 5; j++)
		{
			vec2 texcoord = v_texcoord + vec2(float(j) / float(u_height));
			float g = edgeDetect(texcoord);
			if (g > 0.9)
			{
				weight += 1.0 - abs(float(j)) / 5.0;
			}
		}
		gl_FragColor = vec4(0.8*texture2D( u_shadeTex, v_texcoord).rgb + float(weight)/5.0*vec3(1.0, 1.0, 0.0), 1.0); 
	}
		
}