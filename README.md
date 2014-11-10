------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------


This project requires any graphics card with support for a modern deferred shader pipeline. 

This project requires AMD, NVIDIA, or Intel card from the past few years,
and it also requires a WebGL capable browser. 

Please also ensure that you have below WebGL extensions, `OES_texture_float`, `OES_texture_float_linear`, `WEBGL_depth_texture` and `WEBGL_draw_buffers`.
Recommendation is to use latest Firefox / Chrome running on GPU, and with D3D11.


KEYBOARDS
-------------------------------------------------------------------------------

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
* 5 - Diffuse Lambert Shading
* 6 - Blinn Shading
* 0 - Full deferred pipeline

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
illumation
Stage 3 renders the post processing
* quad.vert
* post.frag



FEATURES
-------------------------------------------------------------------------------


* Diffuse Shading  
![Lambert](/pics/lambert.png)

* Blinn Shading  
![Blinn](/pics/blinn.png)

* Bloom  
![Bloom](/pics/bloom1.png)  
Bloom was done by 2 Guassian filters on color, one is 5x5, and the other one is 21x21.
Two of them together creates nice blurring bloom effect.  


* Toon Shading + Sobel Filter Silhouette  
![Toon](/pics/toon.png)  
Toon was done by Sobel filter on illumination.  


* Screen Space Ambient Occlusion 

You must implement two of the following extras:
* The effect you did not choose above
* Compare performance to a normal forward renderer with
  * No optimizations
  * Coarse sort geometry front-to-back for early-z
  * Z-prepass for early-z
* Optimize g-buffer format, e.g., pack things together, quantize, reconstruct z from normal x and y (because it is normalized), etc.
  * Must be accompanied with a performance analysis to count
* Additional lighting and pre/post processing effects! (email first please, if they are good you may add multiple).


RUNNING THE CODE
-------------------------------------------------------------------------------

Since the code attempts to access files that are local to your computer, you will either need to:

* Run your browser under modified security settings, or
* Create a simple local server that serves the files

FIREFOX: 
change ``strict_origin_policy`` to false in about:config 

CHROME:  
run with the following argument in cmd
 `chrome.exe --allow-file-access-from-files --enable-webgl-draft-extensions --enable-d3d11`

OSX:
`open -a "Google Chrome" --args --allow-file-access-from-files`


RUNNING A SIMPLE SERVER: 

If you have Python installed, you can simply run a simple HTTP server off your
machine from the root directory of this repository with the following command:

`python -m SimpleHTTPServer`


PERFORMANCE EVALUATION
-------------------------------------------------------------------------------


REFERRENCES
-------------------------------------------------------------------------------
* Bloom : [GPU Gems](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* Bloom: http://prideout.net/archive/bloom/
* Screen Space Ambient Occlusion : [Floored Article](http://floored.com/blog/2013/ssao-screen-space-ambient-occlusion.html)
* Toon Shader: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/
* Toon Silhouette: http://floored.com/blog/2014/sketch-rendering.html
* Edge Detection: [Illumination Method]http://mewgen.com/webgl/s/sobel.html
* Sobel Filter: [Sobel Filter Convolution] http://jabtunes.com/labs/3d/webgl_postprocessing2.html
* Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this assignment.
* This project makes use of [three.js](http://www.threejs.org).
