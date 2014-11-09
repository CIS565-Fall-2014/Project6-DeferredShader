------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------


This project requires any graphics card with support for a modern deferred shader pipeline. 

This project requires AMD, NVIDIA, or Intel card from the past few years,
and it also requires a WebGL capable browser. 

Please also ensure that you have below WebGL extensions, `OES_texture_float`, `OES_texture_float_linear`, `WEBGL_depth_texture` and `WEBGL_draw_buffers`.
Recommendation is to use latest Firefox / Chrome running on GPU, and with D3D11.


-------------------------------------------------------------------------------
KEYBOARDS:
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
* 0 - Full deferred pipeline

* mouse - camera rotation

-------------------------------------------------------------------------------
PIPELINE:
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


-------------------------------------------------------------------------------
REQUIREMENTS:
-------------------------------------------------------------------------------

In this project, you are given code for:
* Loading .obj file
* Forward shading pipeline

NOTE : The full deferred pipeline will be released on Friday.  If you set up
your deferred pipeline for extra credit, please submit a pull request by Friday.
If it is partially done, we will give partial extra credit.

The baseline OpenGL shaders for the rest of the pipeline have been provided to give you
a sense of what will be neede in subsequent passes.

You are required to implement:
* Either of the following effects
  * Bloom
  * "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion 

**NOTE**: Implementing separable convolution will require another link in your pipeline and will count as an extra feature if you do performance analysis with a standard one-pass 2D convolution. The overhead of rendering and reading from a texture _may_ offset the extra computations for smaller 2D kernels.

You must implement two of the following extras:
* The effect you did not choose above
* Compare performance to a normal forward renderer with
  * No optimizations
  * Coarse sort geometry front-to-back for early-z
  * Z-prepass for early-z
* Optimize g-buffer format, e.g., pack things together, quantize, reconstruct z from normal x and y (because it is normalized), etc.
  * Must be accompanied with a performance analysis to count
* Additional lighting and pre/post processing effects! (email first please, if they are good you may add multiple).

-------------------------------------------------------------------------------
RUNNING THE CODE:
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


-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------


-------------------------------------------------------------------------------
REFERRENCES
-------------------------------------------------------------------------------
* Bloom : [GPU Gems](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* Screen Space Ambient Occlusion : [Floored
  Article](http://floored.com/blog/2013/ssao-screen-space-ambient-occlusion.html)
* Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this assignment.
* This project makes use of [three.js](http://www.threejs.org).
