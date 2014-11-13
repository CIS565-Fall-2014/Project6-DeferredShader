precision highp float;

uniform sampler2D u_shadeTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;

uniform int u_width;
uniform int u_height;
uniform int u_displayType;
uniform vec3 u_kernel[100];


varying vec2 v_texcoord;

#define KERNEL_SIZE 25  // has to be an odd number
#define DISPLAY_TOON 7
#define DISPLAY_BLOOM 6
#define DISPLAY_BLINN 5
#define DISPLAY_SSAO 8
#define DISPLAY_DOF 9

float w =  1.0 / float(u_width);
float h =  1.0 / float(u_height);
float linearizeDepth( float exp_depth, float near, float far ){
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float gaussian2d(int x,int y,int n) {
    float sigma = 2.0;
    float fx = float(x) - (float(n) - 1.0) / 2.0;
    float fy = float(y) - (float(n) - 1.0) / 2.0;
   return (exp(-abs(fx*fy)/ (2.0*sigma*sigma)))/ (2.0 * 3.1415926 *sigma*sigma);
}

vec4 bloomShader() {
    
    float width = (float(KERNEL_SIZE) - 1.0) / 2.0;
    vec3 color = vec3(0.0,0.0,0.0);
    for(int i=0; i< KERNEL_SIZE; i++){
        for(int j=0; j< KERNEL_SIZE; j++){
            vec2 tc = v_texcoord;
                tc.y += (float(i)-width)*h;
                tc.x += (float(j)-width)*w;
               color += gaussian2d(i,j,KERNEL_SIZE) * texture2D(u_shadeTex, tc).rgb;
            }
       }

    return vec4(color,1.0);
}
//This function blurs the depth buffer and subtracts it from the original (a high pass filter)
float round(float f, int num) {
  return floor(float(num+1)*f)/float(num);
}
float detectEdge() {
  float result = linearizeDepth(texture2D(u_depthTex, v_texcoord).x, u_zNear, u_zFar);
  for (int i = -4; i <= 4; i++) {
    for (int j = -4; j <= 4; j++) {
        result -= linearizeDepth(texture2D(u_depthTex, v_texcoord + vec2(w*float(i), h*float(j))).x, u_zNear, u_zFar)/(81.0);
    }
  }
  return result;
}
vec4 toonShader(vec3 color, int numColors) {
  // Flatten the color
  vec3 p_color = vec3(round(color.r, numColors), round(color.g, numColors), round(color.b, numColors));
  // Sharpen the edges
  return abs(detectEdge()) > 0.005 ? vec4(vec3(0.0), 1.0) : vec4(p_color, 1.0);
}

vec4 SSAO(vec3 color) {
  float occlusion = 0.0;

  vec3 normal = texture2D(u_normalTex, v_texcoord).xyz;
  vec3 position = texture2D(u_positionTex, v_texcoord).xyz;

  vec3 rvec = vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal);

  float thisDepth = linearizeDepth(texture2D(u_depthTex, v_texcoord).x, u_zNear, u_zFar);

  for (int i = 0; i < 100; i++) {
   vec3 sample = tbn * u_kernel[i];
   vec2 offset = sample.xy;
   offset.x *= w;
   offset.y *= h;

   float sampleDepth = linearizeDepth(texture2D(u_depthTex, v_texcoord + offset.xy).x, u_zNear, u_zFar);

   occlusion += (thisDepth - sample.z > sampleDepth) ? 1.0 : 0.0;
  }

  occlusion = 1.0 - (occlusion / float(100));

  return vec4(vec3(occlusion), 1.0);
}
vec4 Blur() {
   float depth = texture2D(u_depthTex, v_texcoord).r;
   depth = 1.0 -linearizeDepth( depth, u_zNear, u_zFar );
   vec2 texelSize = vec2(1.0/w, 1.0/h);
   vec3 result = vec3(0.0,0.0,0.0);

   const int uBlurSize = 10;
   int depB = int(float(uBlurSize) * depth);
   
   vec2 hlim = vec2(float(-uBlurSize) * 0.5 + 0.5);
    for (int i = 0; i < uBlurSize; ++i) {
        if(i<=depB) 
        {
            for (int j = 0; j < uBlurSize; ++j) {
                if(j<=depB)
                {
                    vec2 offset = (hlim + vec2(float(i), float(j))) * texelSize;
                    result += texture2D(u_shadeTex, v_texcoord + offset).rgb;
                }
            }
        }

    }

   vec4 fResult = vec4(result / float(uBlurSize * uBlurSize),1.0);
   return fResult;
}
void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;
  if(u_displayType == DISPLAY_BLINN)
    gl_FragColor = vec4(color, 1.0);
  if(u_displayType == DISPLAY_BLOOM)
    gl_FragColor = bloomShader(); 
  if(u_displayType == DISPLAY_TOON)
    gl_FragColor = toonShader(color, 3); 
  if(u_displayType == DISPLAY_SSAO)
    gl_FragColor = SSAO(color); 
  if(u_displayType == DISPLAY_DOF)
    gl_FragColor = vec4(color, 1.0);; 
    
}