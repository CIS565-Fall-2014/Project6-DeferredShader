------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
![a](results/all_shaders_cow.gif)
![a](results/all_shaders_sponza.gif)
![a](results/A_sponza.JPG)
-------------------------------------------------------------------------------
NOTE:
-------------------------------------------------------------------------------
This project requires any graphics card with support for a modern OpenGL 
pipeline. Any AMD, NVIDIA, or Intel card from the past few years should work 
fine. And it also requires a WebGL capable browser. The project is known to 
have issues with Chrome on windows, but Firefox seems to run it fine.

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------

In this project, I wrote GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer, and some interesting shaders.

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
* 5 - Blinn-Phong Shader
* 6 - Bloom Shader
* 7 - Toon Shader
* 8 - Ambient Occlusion
* 9 - Pixelation Shader
* 0 - Frosted Glass Shader

There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
Feature List:
-------------------------------------------------------------------------------

In this project, I was given code for:
* Loading .obj file
* Deferred shading pipeline
* GBuffer pass

I implemented:
* Bloom Shading
* "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion
* Diffuse and Blinn-Phong shading
* Pixelation Shading
* Frosted Glass Shading


-------------------------------------------------------------------------------
SHADERS:
-------------------------------------------------------------------------------
#### Blinn-Phong

#### Bloom

#### Toon

#### Ambient Occlusion (SSAO)

#### Pixelation

#### Frosted Glass


The performance evaluation is where you will investigate how to make your 
program more efficient using the skills you've learned in class. You must have
performed at least one experiment on your code to investigate the positive or
negative effects on performance. 

We encourage you to get creative with your tweaks. Consider places in your code
that could be considered bottlenecks and try to improve them. 

Each student should provide no more than a one page summary of their
optimizations along with tables and or graphs to visually explain any
performance differences.

-------------------------------------------------------------------------------
RUNNING THE CODE:
-------------------------------------------------------------------------------

FIREFOX: change ``strict_origin_policy`` to false in about:config 

-------------------------------------------------------------------------------
PERFORMANCE ANALYSIS:
-------------------------------------------------------------------------------

FIREFOX: change ``strict_origin_policy`` to false in about:config 

---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
