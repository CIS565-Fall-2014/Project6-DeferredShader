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
![a](results/blinn_phong.JPG)
![a](results/blinn_phong_ao.JPG)

#### Bloom
![a](results/bloom.JPG)

reference:

http://prideout.net/archive/bloom/

Guassian Function: http://mathworld.wolfram.com/GaussianFunction.html

#### Toon
![a](results/toon2.JPG)
![a](results/toon_sponza.JPG)

reference:

http://en.wikibooks.org/wiki/GLSL_Programming/Unity/Toon_Shading

For Toon shading, there are three main parts need to be considered:

* diffuse surface
* contour
* specular surface

For diffuse/specular parts, I used similar lighting algorithm as Blinn-Phong to get the position of diffuse and specular positions on the object. Then I used the value of dot(Normal, LightDir) as a threshold to classify the diffuse part into 2 levels to make a little shadow effects, then set constant color for each level (one brighter and one darker).

For contour part, I referred to the algorithm here: http://www.forceflow.be/2010/04/14/contour-and-valley-detection-using-glsl/
The main idea is to calculate the intensity surrounding current pixel and compared them with the intensity of current pixel, if there are far more darker surrouding pixels then brighter ones, then we can tell that current pixel is on the contour.


#### Ambient Occlusion (SSAO)
![a](results/AO.JPG)
![a](results/A_sponza.JPG)

reference:

* http://blog.evoserv.at/index.php/2012/12/hemispherical-screen-space-ambient-occlusion-ssao-for-deferred-renderers-using-openglglsl/
* http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html

Main idea:
First, use the random function (http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl) to generate an array of sample kernels within the unit hemisphere. Then scale the kernel values to make the samples evenly distributed.After getting the sample kernels, we can use the kernel as an offset to create a sample point in the vicinity of current pixel:

* vec2 sampleTexCoord = current_texcoord + (kernel * radius);

Then calculate sample point's depth, normal and position, and get the vector (SAMPLE-DIRECTION) from original position to the sample point. Then we can get the angle between SURFACE-NORMAL and SAMPLE-DIRECTION, and the distance between SURFACE-POSITION and SAMPLE-POSITION:

* float Angle = max(dot(viewNormal, sampleDir), 0);
* float Distance = distance(viewPos, samplePos);

Then the AO value += Angle*Distance. Loop all the samples, and the average value of AO is what we have as result.
        


#### Pixelation
![a](results/pixel.JPG)
![a](results/pixel_sponza.JPG)

reference:

http://www.geeks3d.com/20101029/shader-library-pixelation-post-processing-effect-glsl/

I also implemented pixelation shader, with current tilesize = 6. Thus, every 6*6 pixels of the original canvas will combine to be a large "PIXEL" drawing on the canvas. All the 36 original pixels in the large PIXEL will share the same color.

#### Frosted Glass
![a](results/glass.JPG)
![a](results/glass_sponze.JPG)

reference:

http://www.geeks3d.com/20101228/shader-library-frosted-glass-post-processing-shader-glsl/

To make the glass looks frosted, firstly I randomle generated a noise, then drawed splines on the surface of the object based on the value of the noise point.

-------------------------------------------------------------------------------
RUNNING THE CODE:
-------------------------------------------------------------------------------

FIREFOX: change ``strict_origin_policy`` to false in about:config 

-------------------------------------------------------------------------------
PERFORMANCE ANALYSIS:
-------------------------------------------------------------------------------



---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
