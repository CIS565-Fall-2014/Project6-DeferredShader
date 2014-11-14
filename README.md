------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------


-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------

In this project, i write GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer. This project requires a graphic card support for deferred shader pipeline.


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


-------------------------------------------------------------------------------
Bloom
-------------------------------------------------------------------------------
Bloom is a post processing effects. Normally, Bloom effects is implemented with a texture that specify the glow source and then blur the glow source. But here I just treat the whole object as a glow source. I use a gaussian convolution on color from G-buffer.

-------------------------------------------------------------------------------
"Toon" Shading (with basic silhouetting)
-------------------------------------------------------------------------------

Toon shading is a non-photorealistic rendering technique that is used to achieve a cartoonish or hand-drawn appearance of three-dimensional models. To make is cartoonish we don't want many color in the final rendering so I round the colors in the scene to a certain color set. Basic silhouetting is achieved by compare the depth of the object with the background to get the edge.

-------------------------------------------------------------------------------
Screen Space Ambient Occlusion
-------------------------------------------------------------------------------
Ambient occlusion is an approximation of the amount by which a point on a surface is occluded by the surrounding geometry. To achieve this I sample a random position within a hemisphere, oriented along the surface normal at that pixel. Then project the sample position into screen space to get its depth on depth buffer. If the depth buffer value is smaller than sample position's depth, then occlusion accumulates.

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
The performance evaluation is where you will investigate how to make your 
program more efficient using the skills you've learned in class. You must have
performed at least one experiment on your code to investigate the positive or
negative effects on performance. 

We encourage you to get creative with your tweaks. Consider places in your code
that could be considered bottlenecks and try to improve them. 

Each student should provide no more than a one page summary of their
optimizations along with tables and or graphs to visually explain any
performance differences.


---
Reference
---
BLOOM: http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html

SSAO: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
