precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
uniform sampler2D u_noiseTex;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform vec3 u_eyePos;
uniform vec3 u_viewDirection;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

//uniform float u_kernel[25];    //5*5 kernel
//uniform float u_offset;     //texture coord offset

varying vec2 v_texcoord;

uniform float u_kernel3[48];   //3*16 sample
uniform mat4 u_perspMat;

uniform float u_offset;     //texture coord offset in width
uniform float u_offset2;   //texture coord offset in height


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

vec2 rand( const vec2 coord ) {
    vec2 noise;
    
    float nx = dot ( coord, vec2( 12.9898, 78.233 ) );
    float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );
    noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );

    return ( noise * 2.0  - 1.0 ) * 0.0003;
}

/*
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}*/

/*
float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}
*/
float lum(vec4 col) {
  return dot(col.xyz, vec3(0.3, 0.59, 0.11));
}

float determinant(mat2 m) {
  return m[0][0]*m[1][1] - m[1][0]*m[0][1] ;
  }

mat2 inverse(mat2 m) {
  float d = 1.0 / determinant(m) ;
  return d * mat2( m[1][1], -m[0][1], -m[1][0], m[0][0]) ;
  }

mat4 inverse(mat4 m) {
  mat2 a = inverse(mat2(m));
  mat2 b = mat2(m[2].xy,m[3].xy);
  mat2 c = mat2(m[0].zw,m[1].zw);
  mat2 d = mat2(m[2].zw,m[3].zw);

  mat2 t = c*a;
  mat2 h = inverse(d - t*b);
  mat2 g = - h*t;
  mat2 f = - a*b*h;
  mat2 e = a - f*t;

  return mat4( vec4(e[0],g[0]), vec4(e[1],g[1]), 
                  vec4(f[0],h[0]), vec4(f[1],f[1]) );
  }

float compareDepths(const in float depth1, const in float depth2, inout int far) {
    float garea = 2.0;
    float diff = (depth1 - depth2) * 100.0;
    if (diff < 0.4) {
        garea = 0.4;
    } else {
        far = 1;
    }
    float dd = diff - 0.4;
    float gauss = pow(2.718281828459045, -2.0 * dd * dd / (garea * garea));
    return gauss;
}

float calcAO(float depth, float dw, float dh) {
    float radius = 5.0;
    float dd = radius - depth * radius;
    vec2 vv = vec2(dw, dh);
    vec2 coord1 = v_texcoord + dd * vv;
    vec2 coord2 = v_texcoord - dd * vv;
    float temp1 = 0.0;
    float temp2 = 0.0;
    int far = 0;
    float depth1 = linearizeDepth(texture2D(u_depthTex, coord1).r, u_zNear, u_zFar);
    float depth2 = linearizeDepth(texture2D(u_depthTex, coord2).r, u_zNear, u_zFar);
    temp1 = compareDepths(depth, depth1, far);
    if (far > 0) {
        temp2 = compareDepths(depth2, depth, far);
        temp1 += (1.0 - temp1) * temp2;
    }
    return temp1;
}


void main()
{
	vec2 texcoord = v_texcoord;
	vec3 position = texture2D(u_positionTex,texcoord).xyz;
	vec3 normal = texture2D(u_normalTex,texcoord).xyz;
	vec3 color = texture2D(u_colorTex,texcoord).xyz;
	float depth = texture2D(u_depthTex,texcoord).x;
	depth = linearizeDepth(depth, u_zNear, u_zFar);
	//vec3 backGround = vec3(0.686, 0.933, 0.933);
	vec3 backGround = vec3(0.0, 0.0, 0.0);
	normal = normalize(normal);
	
	float diffuseTerm = abs(dot( normal,  normalize(u_lightDir )));
	diffuseTerm =  clamp(diffuseTerm, 0.0, 1.0);
	
	if(depth<0.99){
		if(u_displayType == 5){  
			gl_FragColor = vec4(0.8*diffuseTerm * u_lightColor * color , 1.0);
		}
		else if (u_displayType == 6){
			vec3 viewDir = normalize(position - u_eyePos);
			vec3 reflectedLightDir = reflect(u_lightDir, normal);
			float specularTerm = abs(dot(reflectedLightDir, viewDir));
			specularTerm = pow(specularTerm, 3.0);
			
			//float specularTerm = pow(diffuseTerm, 3.0);
			gl_FragColor = vec4((0.8*diffuseTerm + 0.4 * specularTerm )* u_lightColor * color , 1.0);
		}
		else if(u_displayType == 7){  //bloom
		
			//gl_FragColor = vec4(color, depth);
			gl_FragColor = vec4(0.8*diffuseTerm * u_lightColor * color ,depth);
			
		}
		else if(u_displayType == 8){  //toon
			gl_FragColor = vec4(color, diffuseTerm);
			
			/*vec3 toon;
			if (diffuseTerm > 0.951)   //cos(18)
				toon = vec3(1.0,0.5,0.5);
			else if(diffuseTerm> 0.809)   //cos(36)
				toon = vec3(0.8,0.4,0.4);
			else if (diffuseTerm> 0.587)   //cos(54)
				toon = vec3(0.6,0.3,0.3);
			else if (diffuseTerm > 0.309)    //cos(72)
				toon = vec3(0.4,0.2,0.2);
			else if (diffuseTerm > 0.01)    //cos(90)
				toon = vec3(0.2,0.1,0.1);
			vec3 viewDir = normalize(u_eyePos - position);
			float edge = (dot(viewDir, normal) > 0.3) ? 0.0 : 1.0;
			gl_FragColor = vec4(toon + vec3(edge,edge,edge),1.0);*/
			
		}
		else if(u_displayType == 9 || u_displayType == 0){
			//gl_FragColor = vec4(position, depth);

            float AO = 0.0;
		/*	
			//reconstruct position and normal in world space
			vec3 origin = u_viewDirection * depth + u_eyePos;
			normal = texture2D(u_normalTex,texcoord).xyz * 2.0 - 1.0;
		
			vec2 coeff = vec2(1.0/(u_offset*4.0), 1.0/(u_offset2*4.0));  //noise texture is 4x4 yet the entire image is width x height
			//vec3 noise = texture2D(u_noiseTex, texcoord * coeff).rgb * 2.0 - 1.0;   //random rotation kernel
            vec3 noise = vec3(rand(texcoord), rand(texcoord), 0.0);
			//gl_FragColor = vec4(abs(noise), 1.0);

			vec3 tangent = normalize(noise - normal * dot(noise, normal));   //Gram-Schmidt process
			vec3 bitangent = cross(normal, tangent);
			mat3 tbn = mat3(tangent, bitangent, normal);   //use this to transform sample kernel
		
			float radius = 5.0;
			vec3 direction;
			vec3 sample;
			vec4 occuluder;
			float occuluderDepth;
            vec3 occuluderPos;
			float scale;
            vec3 kernel;
			
			for (int i = 0; i < 16; i++) {   //sample kernel3 size is 16
                scale = float(i) / 16.0;
                scale = mix(0.1, 1.0, scale * scale);
                kernel = vec3(rand(texcoord)*2.0 -1.0,rand(texcoord)*2.0 - 1.0, rand(texcoord));
				//get hemisphere sample position in view space
               //kernel = vec3(u_kernel3[i*3+0], u_kernel3[i*3+1], u_kernel3[i*3+2]);
			   direction = tbn * kernel;
			   sample = direction * radius + origin;
			  
				//project sample position in screen space
			   occuluder = u_perspMat * vec4(sample, 1.0);
			   occuluder.xy = (occuluder.xy / occuluder.w) * 0.5 + 0.5;
			  
				//get occluder depth
			   occuluderDepth = texture2D(u_depthTex, occuluder.xy).r;
			   occuluderDepth = linearizeDepth(occuluderDepth, u_zNear, u_zFar);
               occuluderPos = u_viewDirection * occuluderDepth + u_eyePos;
			   //sampleDepthActual = length(sample - u_eyePos);
			  
				//accumulate if occluded
				//float rangeDelta  = abs(sampleDepthActual - sampleDepth);
				//float rangeCheck  = smoothstep(0.0, 1.0, radius/ rangeDelta);
				//AO += rangeCheck*step( sampleDepth, sampleDepthActual);
			   if( occuluderPos.z > sample.z )
					AO += 1.0;
				
			}
			//gl_FragColor = vec4(occuluder.rgb, 1.0);*/


                vec2 noise = rand(texcoord);  
                float w = u_offset /depth + (noise.x * (1.0 - noise.x));
                float h = u_offset2 / depth + (noise.y * (1.0 - noise.y));
                float pw;
                float ph;
                float dz = 0.0625;   // 1/16
                float z = 1.0 - dz / 2.0;
                float l = 0.0;
                for (int i = 0; i < 16; i++) {
                    float r = sqrt(1.0 - z);
                    pw = cos(l) * r;
                    ph = sin(l) * r;
                    AO += calcAO(depth, pw * w, ph * h);
                    z = z - dz;
                    l = l + 2.399963229728653;
                }



			AO = 1.0 - (AO /16.0);
            float final = mix( AO, 1.0, lum(vec4(color,1.0)));
            if(u_displayType == 9)  //only AO
                gl_FragColor = vec4(final, final, final,  1.0);  //then pass into post.frag to blur!
            else{  //composited AO
                color = 0.8*diffuseTerm * u_lightColor * color;
                gl_FragColor = vec4(color,  final);
            }
	



		/*	float blurSize = 0.008;

			vec4 AO = vec4(0.0, 0.0, 0.0, 0.0);
		    float rnd = 1.0 - rand(texcoord.xy) * 0.3;
		    float cavityfactor = 0.0;
		    vec3 norm = vec3(0.0);
		    vec3 samp = vec3(0.0);
		    float d = getDepth(u_depthTex, texcoord);
            vec3 base = vec3(0.5,0.5,0.5);

            float factor;
            for(int i=-4; i<=4; i++){
               // rnd = 1.0 - rand(texcoord.xy) * 0.3;
                factor = -0.0325 * abs(float(i)) + 0.18;
                samp = texture2D(u_normalTex, vec2(texcoord.x + - float(i) * blurSize * rnd, texcoord.y)).rgb;
                norm = (samp - vec3(0.5, 0.5, 1.0)) * vec3(2.0, 2.0, 1.0);
                if (abs(d - getDepth(u_depthTex, vec2(texcoord.x + - float(i) * blurSize * rnd, texcoord.y))) < 0.01) {
                    cavityfactor -= norm.x * factor * sign(float(i));
                    AO += vec4(base, 1.0) * factor;
                } else {
                    AO += texture2D(u_depthTex, texcoord.xy) * factor;
                    cavityfactor -= factor;
                }

            }

             gl_FragColor = vec4(AO.rgb * pow(1.0 - cavityfactor, 0.6), 1.0);*/
		}
	}
	else{
		gl_FragColor = vec4(backGround, 0);
	}

	//gl_FragColor = vec4(u_lightColor,1.0);
	//gl_FragColor = vec4(u_lightDir,1.0);
	   
	//vec3 lightDir = vec3(0.0, 1.0, 1.0);
	//vec3 lightCol = vec3(1.0,1.0,0.0);
	//gl_FragColor = vec4(vec3(dot(lightDir, normal)) * color * lightCol, 1.0);
}
