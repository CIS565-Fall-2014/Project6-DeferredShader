------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------
Due Wed, 11/12/2014 at Noon
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
NOTE:
-------------------------------------------------------------------------------
This project requires any graphics card with support for a modern OpenGL 
pipeline. Any AMD, NVIDIA, or Intel card from the past few years should work 
fine, and every machine in the SIG Lab and Moore 100 is capable of running 
this project.

This project also requires a WebGL capable browser. The project is known to 
have issues with Chrome on windows, but Firefox seems to run it fine.

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------

In this project, I implemented the basic deferred shader. I write GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer.

The live demo can be found here:
[Live demo](https://cdn.rawgit.com/chiwsy/Project6-DeferredShader/master/index.html)

Some of the results from this project:
![Blinn-Phong](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/BlinnPhong.png)
![Unsharp](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Unsharp.png)
![Comparing Bling-Phong with Unsharp](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Compare.png)
![Bloom](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Bloom.png)
![Toon](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Toon.png)
![SSAO](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/SSAO.png)

![All effects in sequence](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/AllEffects.gif)
![Debug View](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/DebugView.gif)
![Blinn-Phong](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Blinn_Phong.gif)
![More Visual Effects](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Blinn_Phong.gif)
![Blinn-Phong VS. Unsharp](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/BlinnPhongVsUnsharp.gif)
-------------------------------------------------------------------------------
OVERVIEW:
-------------------------------------------------------------------------------
The deferred shader here will have the following stages:

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
* 5 - Blinn-Phong
* 6 - Bloom
* 7 - Toon
* 8 - SSAO
* 9 - Unsharp
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
Functions:
-------------------------------------------------------------------------------

In this project, you are given code for:
* Loading .obj file
* Deferred shading pipeline
* GBuffer pass

I have implemented:
* Bloom
* "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion
* Diffuse and Blinn-Phong shading

And one additional post effect:
* Unsharp Mask



-------------------------------------------------------------------------------
RUNNING THE CODE:
-------------------------------------------------------------------------------

Since the code attempts to access files that are local to your computer, you
will either need to:

* Run your browser under modified security settings, or
* Create a simple local server that serves the files


FIREFOX: change ``strict_origin_policy`` to false in about:config 

CHROME:  run with the following argument : `--allow-file-access-from-files`

(You can do this on OSX by running Chrome from /Applications/Google
Chrome/Contents/MacOS with `open -a "Google Chrome" --args
--allow-file-access-from-files`)

* To check if you have set the flag properly, you can open chrome://version and
  check under the flags

RUNNING A SIMPLE SERVER: 

If you have Python installed, you can simply run a simple HTTP server off your
machine from the root directory of this repository with the following command:

`python -m SimpleHTTPServer`

-------------------------------------------------------------------------------
RESOURCES:
-------------------------------------------------------------------------------

The following are articles and resources that have been chosen to help give you
a sense of each of the effects:

* Bloom : [GPU Gems](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* Screen Space Ambient Occlusion : [Floored
  Article](http://floored.com/blog/2013/ssao-screen-space-ambient-occlusion.html)

-------------------------------------------------------------------------------
Performance:
-------------------------------------------------------------------------------
For my browser, I cannot take advantage of the draw buffer. Therefore the program reduced to multi-pass version which is very slow when it comes to the performance part. 
![Performance](https://github.com/chiwsy/Project6-DeferredShader/blob/master/Image/Performance.png)



---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
