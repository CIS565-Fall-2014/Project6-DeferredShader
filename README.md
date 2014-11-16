------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
![glow25](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_25.png)
![glow15](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_15.png)
![glow10](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_10.png)
![glow5](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_5.png)
![glow0](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_0.png)


-------------------------------------------------------------------------------
CONTENTS:
-------------------------------------------------------------------------------
The Project5 root directory contains the following subdirectories:
	
* js/ contains the javascript files, including external libraries, necessary.
* assets/ contains the textures that will be used in the second half of the
  assignment.
* resources/ contains the screenshots found in this readme file.

 This Readme file edited as described above in the README section.

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
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
Implemented
-------------------------------------------------------------------------------
  * Bloom
  * "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion
* Diffuse and Blinn-Phong shading

-------------------------------------------------------------------------------
Bloom
-------------------------------------------------------------------------------
![glow25](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_25.png)
![glow15](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_15.png)
![glow10](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_10.png)
![glow5](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_5.png)
![glow0](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/glow_0.png)

-------------------------------------------------------------------------------
Ambient Occlusion
-------------------------------------------------------------------------------
![off](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_off.png)
![no blur](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_0.png)
![no blur white](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_0_white.png)
![2 blur](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_2.png)
![2 blur white](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_2_white.png)
![5 blur](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_5.png)
![5 blur white](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/AO_5_white.png)


-------------------------------------------------------------------------------
Toon Shading
-------------------------------------------------------------------------------
![off](https://raw.githubusercontent.com/RTCassidy1/Project6-DeferredShader/master/renders/TrexToon.png)

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
I'm running on a 2.7ghz i7 macbookPro with a NVIDIA GeForce GT 650M 1024 MB video card.  All my tests were done in firefox.

In my implementation my post processing had a gaussian kernel that I can set to various widths and change the standard deviation. 
* I broke Ambient Occlusion into a separate stage that rendered to a texture so that I could blur it in the post-processing phase.
* With the Blur off for ambient occlusion my performance oscilated between 57 and 60 frames per second
* with the Blur at 2 pixels in each direction (25 total pixels) the performance dropped to 48-49 FPS
* when I expanded the blur to 5 pixels each direction (121 pixels) performance dropped to 25-26 FPS

I also included a glow in my post processing.  I measured it's performance with Ambient Occlusion turned off.
* no glow performed at 60 FPS
* glow of 5 pixels each direction performed at 40 FPS
* glow of 10 pixels each direction performed at 21 FPS
* glow of 15 pixels each direction performed at 12 FPS
* glow of 25 pixels each direction performed at 5 FPS

The bottleneck for both of these features was the gaussian blur.  The reason is I implemented it as a 2d blur in a single shader.  What I want to do , but haven't had time yet, is to implement two 1d gaussian blurs.  One for the X direction and a second one for the Y.  That way if my Gaussian is +/- 25 pixels in X and Y I only have to sample 101 pixels instead of 2601.  This should offer a huge improvement in my glow25 performance.

---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
This project also uses stats.js for performance analysis
The Trex model used in this project came from TurboSquid
