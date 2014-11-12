------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------
Due Wed, 11/12/2014 at Noon
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------

In this project, I wrote GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer.

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

I implemented basic feature:
* "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion
* Diffuse and Blinn-Phong shading

Extra features:
* Glowing/bluring
* Edge detection that can illustrate mesh of the object


-------------------------------------------------------------------------------
RESULTS
-------------------------------------------------------------------------------
Basic:
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/normal_cat.jpg)


Blur effect by using smooth kernel
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/cat_glow.jpg)

Toon effect with four colour levels 
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/cat_toon.jpg)


Sobel Filter Application to draw the edges
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/cat_mesh.jpg)

SSAO which use the method of sampling in sphere
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/ao3.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/cat.jpg)

Art Pieces during the works
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/ao.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/AO2.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/funny2.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/screwedzebra.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/tiger_mesh.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/zynga_effect.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/toon_multiple_lights.jpg)
![Final Image](https://github.com/zxm5010/Project6-DeferredShader/blob/master/images/screwdup1.jpg)

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
For this project, since the obj loader can not load extremely large obj files. The running speed of the is always 60 FPS, until I increase the light to 1000.



---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
