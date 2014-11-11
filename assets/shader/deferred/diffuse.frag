precision highp float;
#define DISPLAY_TOON 5
#define DISPLAY_BLINN 7

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;


uniform vec3 u_lightpos;
uniform mat4 u_mvp;
uniform vec3 u_lightcolor;
uniform vec3 u_eyepos;


varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec3 GetNormal(vec3 origin)
{
	float eps = 0.0000001;
	if(length(origin)<eps)
		return origin;
	else
		return origin/(length(origin));
}


void main()
{
	vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
	vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
	vec4 color = texture2D( u_colorTex, v_texcoord );
	float depth = texture2D( u_depthTex, v_texcoord ).x;


	vec3 lightpos = vec3 (u_mvp * vec4(u_lightpos, 1.0 ));
  // Write a diffuse shader and a Blinn-Phong shader
  // NOTE : You may need to add your own normals to fulfill the second's requirements
  if( u_displayType == DISPLAY_BLINN )
  {		
	vec3 L = GetNormal(lightpos-position);
	vec3 N = GetNormal(normal);
	vec3 E = GetNormal(u_eyepos - position);
	vec3 H = GetNormal(E + L); 

	float shininess = 100.0;
	//Blinn-Phong
	float diffusefactor =  clamp(dot(N,L),0.0,1.0);
	float specularfactor = pow(max(dot(N,H),0.0),shininess);

	vec3 lightcolor = u_lightcolor;
	vec3 Outcolor = 
		lightcolor * diffusefactor * texture2D(u_colorTex, v_texcoord).rgb + lightcolor * specularfactor;


    gl_FragColor = vec4(Outcolor, 1.0);
  }
  else if( u_displayType == DISPLAY_TOON )
  {
	    vec4 toonColor1 = vec4(0.6,0.6,1.0,1.0);
		vec4 toonColor2 = vec4(0.5,0.5,0.9,1.0);
		vec4 toonColor3 = vec4(0.4,0.4,0.8,1.0);
		vec4 toonColor4 = vec4(0.3,0.3,0.7,1.0);
		vec4 toonColor5 = vec4(0.2,0.2,0.6,1.0);

	    vec4 color;

	    float intensity = max(0.0,dot(normalize(lightpos-position),normal));

        if(intensity>=0.8)
            color = toonColor1;
	    else if(intensity>=0.6 && intensity < 0.8)
        {
            float mixa = (intensity - 0.6) / 0.2;
            color = mix(toonColor1,toonColor2,mixa);   
        }
        else if(intensity>=0.4 && intensity < 0.6)
        {
            float mixa = (intensity - 0.4) / 0.2;
            color = mix(toonColor2,toonColor3,mixa);    
        }
		else if(intensity<0.4 && intensity>=0.2)
        {
            float mixa = (intensity - 0.2)/ 0.2;
            color = mix(toonColor3,toonColor4,mixa);    
        }
		else
        {
            float mixa = intensity/ 0.2;
            color = mix(toonColor4,toonColor5,mixa);    
        }

	    gl_FragColor = color;
	}
 
 
	if (depth > 0.99) 
	       gl_FragColor = vec4(0.8,0.8,0.8,1.0);
}
