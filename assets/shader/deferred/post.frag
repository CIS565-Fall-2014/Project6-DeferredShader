precision highp float;
#define DISPLAY_DIFFUSE     5
#define DISPLAY_TOON        6
#define DISPLAY_BLOOM       7
#define DISPLAY_SSAO        8

#define KernelSize          11
#define SampleSize          100
uniform sampler2D u_shadeTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;
uniform vec3 u_kernel[100];
uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}



float Gblur(int x,int y,int n) {
    float sigma = 1.0;
    float fx = float(x) - (float(n) - 1.0) / 2.0;
    float fy = float(y) - (float(n) - 1.0) / 2.0;
    return (exp(-abs(fx*fy)/ (2.0*sigma*sigma)))/ (2.0 * 3.1415926 *sigma*sigma);
}

vec4 bloom() {
    float offset=0.001;
    vec3 color=vec3(0.0,0.0,0.0);
    for (int i=0; i<=KernelSize; i++) {
        for (int j=0;j<=KernelSize;j++) {
            vec2 temp=v_texcoord;
            temp.x=temp.x+(float(i)-float(KernelSize)/2.0+0.5)*offset;
            temp.y=temp.y+(float(j)-float(KernelSize)/2.0+0.5)*offset;
            color=color+Gblur(i,j,KernelSize)*texture2D(u_shadeTex,temp).rgb;
        }
    }
    return vec4(color,1.0);
}
float rand(float co){
    return fract(sin(dot(vec2(co,co) ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 SSAO() {
    vec3 center=vec3(v_texcoord,texture2D(u_depthTex,v_texcoord).r);
    float radius=0.01;
    vec3 normal=texture2D(u_normalTex,v_texcoord).xyz;
    float depth=texture2D(u_depthTex,v_texcoord).r;
    float occlusion=0.0;
    for(int i=0;i<=SampleSize;i++)
    {
        float x=rand(1.0+float(i)+sin(float(i)));
        float y=rand(2.0+float(i));
        float z=rand(3.0+float(i));
        vec3 r=normalize(vec3(x,y,z));
        vec3 tangent=normalize(r-normal*dot(r,normal));
        vec3 bitangent=cross(normal,tangent);
        vec3 position=center+radius*(tangent*r.x+bitangent*r.y+normal*r.z);
        float depthS=texture2D(u_depthTex,position.xy).r;
        if (depthS>depth) {
            occlusion+=1.0/float(SampleSize);
        }
    }
    if(depth>0.99)
    {
        occlusion=1.0;
    }
    return vec4(occlusion,occlusion,occlusion,1.0);
}


void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
    if (u_displayType==DISPLAY_DIFFUSE||u_displayType==DISPLAY_TOON) {
        gl_FragColor = vec4(texture2D(u_shadeTex, v_texcoord).rgb, 1.0);
    }
    else if(u_displayType==DISPLAY_BLOOM)
    {
        gl_FragColor=bloom();
        
    }
    else if(u_displayType==DISPLAY_SSAO)
    {
        gl_FragColor=SSAO();
    }

    
    
  
}
