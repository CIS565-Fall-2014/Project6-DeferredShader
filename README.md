------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------

[Video demo](https://www.youtube.com/watch?v=rO3hkOwMkNg&feature=youtu.be)


###Diffuse & Blinn-Phong lighting
![](diffuse_blinn-phong.png)

###Toon Shading with silhouetting
To implement toon shader, I calculated the dot product of the light and the normal of each screen point. Then I assigned different colors according to their dot product value, which is divided into 5 bins. For silhouetting, I just check the depth of each neighbours of a pixel, and make it black if the depth is larger than a threshold.

![](Toon.png)

###Bloom
I used the color from Diffuse and Blinn-Phong and made a gaussian convolution to add glow.
![](Bloom.png)

###Screen Space Ambient Occlusion
For SSAO, I sampled 100 points around each screen points and check if their depth is larger than the screen point's depth. The ratio of points has larger depth is used as the color.
![](SSAO.png)


###Performance
| shader|     FPS   |  
|:---------:|:-----------------:|
|    Diffuse Blinn-Phong     |         60       |    
|    Toon     |         59        |    
|   Bloom    |         13       |     
|   SSAO     |   18|



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
* 5 - Diffuse&Blinn-Phong
* 6 - Toon shading
* 7 - Bloom shading
* 8 - SSAO
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.


---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
