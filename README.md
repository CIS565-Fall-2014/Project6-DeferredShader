
#Deferred Shader
This project is about implementing the deferred shader by using WebGL.
The features I implementes including 
* Diffuse and Bling shading  
* Bloom shading with separable convolution 
* Toon shading
* Screen space ambient occlusion  
  
User could use number key to switch different shading effect.
* '0': Diffuse and bling shading
* '9': Toon shading
* '8': Ambient occlusion
* '7': Bloom shading with separable convolution
* '6': Bloom shading without separable convolution 
* '5': Silhouette image 

#Diffuse and bling shading
![Title Image](result/diffuse_bling.jpg)

#Toon shading
What I did in toon shading is that I tried to find the boundaries or silhouette by finding the place where the normal has enormous change.  
In addition, instead of using the continuous RGB to shade the color, I divided the RGB into 5 segments to make the toon like shading. 
![toon shading result](result/toon.jpg)

#Bloom
Because the bloom shading needs the alpha value to represent the place where we want to make it glow. However, our model here lacks the alpha information. 
Therefore, I use the silhouette which I created for toon shading to be my alpha value. The belowing image shows the silhouette which I used to glow my first diffuse_bling shading.  
What difference between the white glow image and green glow image is that I used separable convolution to do the bloom for white glow one.
![bloom result with convolution](silhouette.jpg)
![bloom result with convolution](result/bloom.jpg)
![bloom result without convolution](result/bloom2.jpg)

#Screen space ambient occlusion
![ssao result](result/ssao.jpg)

#Depth value
![debug depth](result/depth.jpg)

#Performance Analysis

#Video
http://youtu.be/U8ZvzvczlKc

#Reference
Bloom: http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html  
SSAO: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html