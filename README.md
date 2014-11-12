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
* Sketch effect

-------------------------------------------------------------------------------
RESULTS
-------------------------------------------------------------------------------



Toon effect with four colour levels 
Sobel Filter Application to draw the edges
Blur effect by using smooth kernel

SSAO which use the method of sampling in sphere
-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
For this project, since the obj loader can not load extremely large obj files. The running speed of the is always 60 FPS, until I increase the light to.



---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
