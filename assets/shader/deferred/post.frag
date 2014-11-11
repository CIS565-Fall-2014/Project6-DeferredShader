precision highp float;

uniform sampler2D u_shadeTex;
//new
//put gaussian here
uniform float u_gaussKernel[25];
uniform vec2 u_textureSize;

varying vec2 v_texcoord;

const float thresh = 0.95;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  vec2 coord = v_texcoord;
  
  vec3 color = vec3(0,0,0);//texture2D( u_shadeTex, v_texcoord).rgb;
  vec3 bloom = vec3(0,0,0);
  /*
  //top Row
  float intensity;
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-2,-2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[0] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-1,-2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[1] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(0,-2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[2] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(1,-2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[3] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(2,-2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[4] / 273.0;
  }
  
  //second Row
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-2,-1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[5] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-1,-1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[6] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(0,-1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[7] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(1,-1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[8] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(2,-1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[9] / 273.0;
  }
  
  //Third Row
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-2,0)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[10] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-1,0)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[11] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(0,0)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[12] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(1,0)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[13] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(2,0)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[14] / 273.0;
  }
  
  //Fourth Row
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-2,1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[15] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-1,1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[16] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(0,1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[17] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(1,1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[18] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(2,1)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[19] / 273.0;
  }
  
  //Fifth Row
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-2,2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[20] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(-1,2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[21] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(0,2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[22] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(1,2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[23] / 273.0;
  }
  
  bloom = texture2D( u_shadeTex, v_texcoord + onePixel * vec2(2,2)).rgb;
  intensity = max(bloom.x, max(bloom.y, bloom.z));
  if(intensity > thresh){
        color += bloom * u_gaussKernel[24] / 273.0;
  }
  
  vec3 currentColor = texture2D( u_shadeTex, v_texcoord).rgb;
  intensity = max(currentColor.x, max(currentColor.y, currentColor.z));
  if(intensity < thresh){
    currentColor += color;
  }
  */
  color = texture2D( u_shadeTex, v_texcoord).rgb;
  gl_FragColor = vec4(color, 1.0); 
  //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}
