------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
In this project, I wrote a basic deferred shading with GLSL and OpenGL. In this deferred lighting pipeline, I implemented some simple effect, including 
Diffuse and Blinn-Phong shading, Bloom, "Toon" shading, and Screen Space Ambient Occlusion.

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/p_bloom1(fps%201).PNG)

-------------------------------------------------------------------------------
CONTENTS:
-------------------------------------------------------------------------------
The root directory contains the following subdirectories:
	
* js/ contains the javascript files, including external libraries, necessary.
* assets/ contains the textures that will be used in the second half of the
  assignment.
* resources/ contains the screenshots found in this readme file.
-------------------------------------------------------------------------------
Control:
-------------------------------------------------------------------------------
The keyboard controls are as follows:
WASDRF - Movement (along w the arrow keys)
* W - Zoom in
* S - Zoom out
* A - Left
* D - Right
* R - Up
* F - Down
* ^ - Up
* v - Down
* < - Left
* \> - Right


* 1 - World Space Position
* 2 - Normals
* 3 - Color
* 4 - Depth
* 5 - Bloom (one-pass)
* 6 - Bloom (two-pass)
* 7 - "Toon" Shading
* 8 - Screen Space Ambient Occlusion
* 9 - Diffuse and Blinn-Phong shading
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
Basic Features:
-------------------------------------------------------------------------------
I've implemented the following basic features:
* Diffuse and Blinn-Phong shading

It's simple for diffuse and blinn-phong shading, just pass the vertex normal, light position and camera position to the shader file, which are used to calculate the the shader color.

suzanne.obj: normal of each vertex

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_normal(fps%2060).PNG)

Diffuse and Blinn-Phong shading:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_diffuse.PNG)

* Bloom (one-pass 2D convolution and two-pass separable convolution)  
http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html

First, I use a 3*3 sobel operator to extra the edge of the model, which are used as the glowing part. Then use a 11 * 11 blur filter to do convolution for the glowing part; then add the flowing texture to the original image.

I also implemented a two-pass convolution operators. I added another post fragment shader to handle the second pass. The two-pass convolution is of higher efficiency compared with the 2D convoluiton operator. 

Bloom (5 * 5 blur filter):

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_bloom(r%3D2).PNG)

Bloom (11*11 blur filter):

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_bloom1.PNG)


* "Toon" Shading (with basic silhouetting)

First, I decretized the color based on the diffuse shading. Then, I used sobel operator to extra the edge and added a dark color to the edge. Finally, combined the reuslts of this two parts.

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_tooon.PNG)

* Screen Space Ambient Occlusion  

I followed the algorithm in this article to do the SSAO.  
http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html

First, generate a sample kernel, generate the noise in a shpere and find the normal-oriented hemisphere. Then, project each sample point into screen space to get the coordinates into the depth buffer. Next, read sampleDepth out of the depth buffer. If this is in front of the sample position, the sample contributes to occlusion. If sampleDepth is behind the sample position, the sample doesn't contribute to the occlusion factor. 

SSAO:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_occlusion.PNG)

Final result wiht SSAO:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/s_ssao.PNG)


Another model: sponza.obj

Normal:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/p_normal(fps%2025).PNG)

Diffuse adn Blinn-Phong shading:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/p_blinn.PNG)

Bloom:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/p_bloom1(fps%201).PNG)

"Toon" shading:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/p_toon(fps%201).PNG)

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
The following chart shows the FPS for each featurs:

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/FPS.JPG)

I also compared the performance of one-pass and two-pass bloom effect with different-size filter. The following chart shows that, two-pass bloom is of higher efficiency than one-pass bloom.

![ScreenShot](https://github.com/liying3/Project6-DeferredShader/blob/master/results/chart%20bloom.JPG)

-------------------------------------------------------------------------------
THIRD PARTY CODE POLICY
-------------------------------------------------------------------------------
* stas.js  
It's a library to visualize realize fps and timing.  
https://github.com/mrdoob/stats.js/
* random noise in GLSL:  
http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/

-------------------------------------------------------------------------------
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
