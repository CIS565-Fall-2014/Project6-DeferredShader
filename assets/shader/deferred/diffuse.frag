precision highp float;
#define DISPLAY_DIFFUSE     5
#define DISPLAY_TOON        6
#define DISPLAY_BLOOM       7
#define DISPLAY_SSAO        8
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform mat4 u_mvp;
uniform vec3 u_eye;
uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}


void main()
{
    // Write a diffuse shader and a Blinn-Phong shader
    // NOTE : You may need to add your own normals to fulfill the second's requirements
    vec3 lightPos=vec3(u_mvp*vec4(2.0,3.0,6.0,1.0));
    vec3 lightCol=vec3(0.8,1.0,1.0);
    vec3 normal=texture2D(u_normalTex,v_texcoord).xyz;
    vec3 position=texture2D(u_positionTex,v_texcoord).xyz;
    vec3 color=texture2D(u_colorTex,v_texcoord).rgb;
    float depth=texture2D(u_depthTex,v_texcoord).x;
    depth=linearizeDepth(depth,u_zNear,u_zFar);
    vec3 L=normalize(lightPos-position);
    vec3 N=normalize(normal);
    vec3 V=normalize(u_eye-position);
    vec3 H=normalize(V+L);
    float diffuse=clamp(dot(N,L),0.0,1.0);
    float specular=pow(max(dot(N,H),0.0),10.0);
    if (u_displayType==DISPLAY_DIFFUSE||u_displayType==DISPLAY_BLOOM) {
        
        vec3 final_color=0.6*lightCol*diffuse*color+0.4*lightCol*specular;
        
        if(depth<0.99)
        {
            gl_FragColor = vec4(final_color, 1.0);
        }
        else
        {
            //background color
            gl_FragColor=vec4(0.8,0.8,0.8,1.0);
        }
    }
    else if(u_displayType==DISPLAY_TOON)//reference:http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/
    {
        float intensity=dot(L,N);
        vec4 color;
        if (depth<0.99) {
            if (intensity>0.8) {
                color=vec4(0.6,0.8,0.6,1.0);
            } else if(intensity>0.6) {
                color=vec4(0.5,0.7,0.5,1.0);
            } else if(intensity>0.4)
            {
                color=vec4(0.4,0.6,0.4,1.0);
            }else if(intensity>0.2)
            {
                color=vec4(0.3,0.5,0.3,1.0);
            }
            else
            {
                color=vec4(0.2,0.4,0.2,1.0);
            }
            
        } else {
            //background color
            color=vec4(0.8,0.8,0.8,1.0);
        }
        //edge
        float c=0.002;
        float threshold=0.999;
        for (int i=-2; i<=2; i++) {
            for (int j=-2;j<=2;j++) {
                float depthdiff=texture2D(u_depthTex,v_texcoord+vec2(float(i)*c,float(j)*c)).x;
                if (depthdiff>threshold) {
                    color=vec4(0.0,0.0,0.0,1.0);
                    break;
                }
            }
        }
        if(depth>0.9)
        {
            color=vec4(0.8,0.8,0.8,1.0);
        }
        gl_FragColor=color;
    }  
}
