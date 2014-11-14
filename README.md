------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------


This project requires any graphics card with support for a modern deferred shader pipeline. 

This project requires AMD, NVIDIA, or Intel card from the past few years,
and it also requires a WebGL capable browser. 

Please also ensure that you have below WebGL extensions, `OES_texture_float`, `OES_texture_float_linear`, `WEBGL_depth_texture` and `WEBGL_draw_buffers`.
Recommendation is to use latest Firefox / Chrome running on GPU, and with D3D11.



FEATURES
-------------------------------------------------------------------------------
Click Here for [Live Demo Page](http://dblsai.github.io/Project6-DeferredShader/)

* **Diffuse Shading**  
![Lambert](/pics/lambert.png)

* **Blinn Shading**  
![Blinn](/pics/blinn.png)

* **Bloom**  
Bloom was done by 2 Guassian filters on color, one is 5x5, and the other one is 21x21.
Two of them together creates nice blurring bloom effect.  
![Bloom](/pics/bloom0.png)  



* **Toon Shading + Sobel Filter Silhouette**  
Toon shading was done by color quantization based on deffuse term, i.e. `dot(lightDir, normal)`.   
Silhouette/outline was done by Sobel filter on illumination, i.e `0.3*r + 0.59*g + 0.11*b`.  
A median filter or other anti-aliasing method could be useful to smooth out the toon shading.  
![Toon](/pics/toon.png)   
![Toon2](/pics/toon2.png)    
 


* **Screen Space Ambient Occlusion**   
SSAO was done based on hemisphere sampling, followed by a simple blur.
First, randomly sample a position in the hemisphere oriented in normal direction. 
Then project the sample position back into screen space, to find its texture coord and hence its depth on depth buffer.
If the depth buffer is actually smaller than sample position's z, then occlusion accumulates.  
![AO](/pics/AOfinal2.png)  
![AO](/pics/AOfinal3.png)  
![AO](/pics/Compare.png)  
From the above comparison, it is obvious that AO creates creases and enhances the rendering of 3D objects.
What's more important is that SSAO is cheap, is done right away in the screen space, and dosen't pose extra load to the deferred shader.

* GUI Control  
Dynamically load obj, dynamically change diffuse color, and many other settings


* **Some Interesting Debugging Images**  
![Normal](/pics/normal3.png)  
![Sample Bug](/pics/bug2.png)  
![Depth](/pics/depth.png)  
![Forward Shader] (/pics/sponza.png)  



PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
A forward shader is of O(no. of vertex * no. of light)  
A deferred shader is of O(screen resolution * no. of light)  

* **Deferred Shader vs Forward Shader**      

I noticed that the performance of Deferred Shader is influenced by the resolution of output, so I changed the canvas size 
and did the following analysis. It shows that the bigger the resolution, the poorer the performance of deferred shader. While, 
forward shader performance is not affected by canvas size. Also, the complexity of scene has influence on both shaders, the more
complex, the poorer the performance.  
Deferred Shader decouples light from geometry, and probably with more lights, the advantage of deferred shader would be abvious.   

![Smaller Reso] (/pics/200x100.png)
![Bigger Reso] (/pics/960x540.png)

* **FX's effect on Deferred Shader Performance**    

It is cheap to do FX in deferred Shader, almost all of the shadings poses no extra work on the shader. While for forward shader, the
 effects would be very expensive to do.  
 
![FX] (/pics/FX.png)

INTERACTION
-------------------------------------------------------------------------------

* W - Zoom in
* S - Zoom out
* ^/R - Up
* v/F - Down
* </A - Left
* >/D - Right
* 1 - World Space Position
* 2 - Normals
* 3 - Color
* 4 - Depth
* 5 - Diffuse Lambert Shading
* 6 - Blinn Shading
* 7 - Bloom
* 8 - Toon
* 9 - Ambient Occulusion
* 0 - Full deferred pipeline (AO+Lambert)
* mouse - camera rotation

PIPELINE
-------------------------------------------------------------------------------
The deferred shader you will write will have the following stages:

Stage 1 renders the scene geometry to the G-Buffer
* pass.vert
* pass.frag

Alternative Stage 1 (for devices that don't have Multiple Render Target)
* posPass.vert
* posPass.frag
* normPass.vert
* normPass.frag
* colorPass.vert
* colorPass.frag

Stage 2 renders the lighting passes and accumulates to the P-Buffer
* quad.vert
* diffuse.frag
* diagnostic.frag

Stage 3 renders the post processing
* quad.vert
* post.frag


RUNNING THE CODE
-------------------------------------------------------------------------------

Since the code attempts to access files that are local to your computer, you will either need to:

* Run your browser under modified security settings, or
* Create a simple local server that serves the files

FIREFOX: 
change ``strict_origin_policy`` to false in about:config 

CHROME:  
run with the following argument in cmd
 `"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files --enable-webgl-draft-extensions --enable-d3d11`

OSX:
`open -a "Google Chrome" --args --allow-file-access-from-files`


RUNNING A SIMPLE SERVER: 

If you have Python installed, you can simply run a simple HTTP server off your
machine from the root directory of this repository with the following command:

`python -m SimpleHTTPServer`
  

REFERRENCES
-------------------------------------------------------------------------------
* Bloom : [GPU Gems](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* Bloom: http://prideout.net/archive/bloom/
* Screen Space Ambient Occlusion : [Floored Article](http://floored.com/blog/2013/ssao-screen-space-ambient-occlusion.html)
* SSAO: [SSAO Tutorial]http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
* Toon Shader: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/
* Toon Silhouette: http://floored.com/blog/2014/sketch-rendering.html
* Edge Detection: [Illumination Method]http://mewgen.com/webgl/s/sobel.html
* Sobel Filter: [Sobel Filter Convolution] http://jabtunes.com/labs/3d/webgl_postprocessing2.html
* Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this assignment.
* This project makes use of [three.js](http://www.threejs.org).
* This project makes use of [dat.GUI](https://code.google.com/p/dat-gui/).
