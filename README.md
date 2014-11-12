------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
To run this project, go to http://webglreport.com/ and check if drawbuffers is supported.
Also, turn on WebGL extensions in About: Flags in Chrome.

###INTRODUCTION:

This is a deferred shading render pipeling which does some cool effects
suc as Screen Space Ambient Occulsion, Toon Shading,and Gaussian Blur

[Video Demo] (https://www.youtube.com/watch?v=dSYRA8L7Y9M&feature=youtu.be)

###Overview of Stages:

* Stage 1 renders the scene geometry to the G-Buffer using:

pass.vert and pass.frag

and writes geometry infromation: position, normal, color and depth into 4 textures.

* Stage 2 renders the ligting, toon shading (includes silouette detection is done here) and a factor of Ambient Occulusion is calculated too.

quad.vert and diffuse.frag

* Stage 3 renders the post processing

quad.vert and post.frag

* The keyboard controls are as follows:
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

###Features:

* diffuse/specular for multiple lights

This is the first pass of the 2 deferred passes. It calculates the diffuse and specular contribution for each light and accumulates them.

Performance impact of lights in a scene of a 10,000 poly Stanford bunny

Number of Lights | FPS
----- | ----- 
10 | 60 FPS 
50 | 60 FPS 
200 | 60 FPS
500 | 60 FPS
1100 | ~ 40 FPS
2000 | ~ 25 FPS

As we can see, the program can run 60 FPS up to almost 1000 lights, which shows that the decoupling of lighting
and scene complexity in the deferred shading pipeline has a big advantage in rendering scene with huge
number of lights

* Toon Shading
![] (5.jpg)

![] (4.jpg)

![] (2.jpg)

Toon shading consists of 2 effects. One is the rendering of silhouette, which is done using the Sobel operator
applied on eyeSpace positions of the fragments. I've also tried applying the operator on the normals and the
result was a rendering of all the edges.

The second effect was finite color space, which was achieve by selecting cut-offs in diffuse and specular
factors.

* Screen-Space Ambient Occlusion (SSAO)

For each fragment, a uniform sample in a sphere centered at it is obtained and for each fragment in the sample,
determines whether it's in front of the fragment in the depth buffer. According to percentrages of the sample
that's in front of the depth buffer, a factor is calculated and it's used as the fragment's color;

![] (7.jpg)
![] (6.jpg)

* Gaussian Blur
Depending on how large is the blur radius, fragments are uniformly sampled in the sphere around the current 
fragment. Gaussian density is calculated for each fragment depending on how far it is.

![] (8.jpg)

* Screen-Space Depth of Field

![] (3.jpg)

First, the distance of the depth of the fragment to the focal length is calculated. Based on this distance
and whether it's in the focus zone, a factor is calculated, which will then be non-linearize by powering it up
to enhance contrast. Then a Gaussian blur would be applied with standard deviation of this factor.

Performance impact of each feature:

Test scene: 10,000 poly Stanford Bunny, 4 lights.

Feature | FPS
----- | ----- 
Diffuse/Specular | 60 FPS 
Gaussian Blur (400 samples) | ~ 58 FPS 
DOP (400 samples) | ~ 58 FPS 
Toon Shading | 60 FPS
SSAO (400 samples) | 60 FPS
SSAO (4096 samples) | 12 FPS

Gaussian Blur, SSAO and DOP impacts the performance the most due to their large amount of samples.


###ACKNOWLEDGEMENTS

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
project

This project makes use of [three.js](http://www.threejs.org).
