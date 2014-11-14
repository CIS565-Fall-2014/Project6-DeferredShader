------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------

[Youtube](https://www.youtube.com/watch?v=ggUH_oqFYuo&feature=youtu.be)

[Live Demo]()

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------

In this project, i write GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer. This project requires a graphic card support for deferred shader pipeline.

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/diffuseSpec.jpg)

-------------------------------------------------------------------------------
OVERVIEW:
-------------------------------------------------------------------------------
The deferred shader you will write will have the following stages:

Stage 1 renders the scene geometry to the G-Buffer
* pass.vert
* pass.frag

Stage 2 renders the lighting passes and accumulates to the P-Buffer
* quad.vert
* diffuse.frag
* diagnostic.frag

Stage 3 renders the post processing
* post.vert
* post.frag

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
* > - Right
* 1 - World Space Position
* 2 - Normals
* 3 - Color
* 4 - Depth
* 5 - Blinn-Phong shading
* 6 - bloom shading
* 7 - Toon shading
* 8 - SSAO
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
Blinn-Phong:
-------------------------------------------------------------------------------

The diffuse and specular shader is implemented in lighting passes and accumulates stage that writes the result to P-buffer.

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/diffuseSpec.jpg)

-------------------------------------------------------------------------------
Bloom
-------------------------------------------------------------------------------
Bloom is a post processing effects. Normally, Bloom effects is implemented with a texture that specify the glow source and then blur the glow source. But here I just treat the whole object as a glow source. I use a gaussian convolution on color from G-buffer.

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/bloom.jpg)

-------------------------------------------------------------------------------
"Toon" Shading (with basic silhouetting)
-------------------------------------------------------------------------------

Toon shading is a non-photorealistic rendering technique that is used to achieve a cartoonish or hand-drawn appearance of three-dimensional models. To make is cartoonish we don't want many color in the final rendering so I round the colors in the scene to a certain color set. Basic silhouetting is achieved by compare the depth of the object with the background to get the edge.

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/toon.jpg)

-------------------------------------------------------------------------------
Screen Space Ambient Occlusion
-------------------------------------------------------------------------------
Ambient occlusion is an approximation of the amount by which a point on a surface is occluded by the surrounding geometry. To achieve this I sample a random position within a hemisphere, oriented along the surface normal at that pixel. Then project the sample position into screen space to get its depth on depth buffer. If the depth buffer value is smaller than sample position's depth, then occlusion accumulates.

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/SSAO.jpg)

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/performance1.jpg)

In diagnostic mode(show normal, position, etc) I just output the color read from G buffer without light accumulation or post processing. From the chart above we can see the stage 2 and 3 of deferred shading is quite computational intense. And I think the performance is not that good because I implement the deferred shader with simple one-pass pipline. So every part get computed no matter is is used or not. I think  Implementing separable convolution will definetely help improving the performance.  

![blinn](https://raw.githubusercontent.com/XJMa/Project6-DeferredShader/master/screenshots/performance2.jpg)

Apparently use more sample kernels to compute SSAO will slow down the computation process, but the result is not as obvious as I expect. I want to test with more kernel computed but my laptop can't handle it when the kernel size exceed 90. 

---
Reference
---
BLOOM: http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html

SSAO: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
