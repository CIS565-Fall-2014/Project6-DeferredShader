------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
INTRODUCTION:
-------------------------------------------------------------------------------
In this project, you will get introduced to the basics of deferred shading. You will write GLSL and OpenGL code to perform various tasks in a deferred lighting pipeline such as creating and writing to a G-Buffer.
-------------------------------------------------------------------------------
Results:
-------------------------------------------------------------------------------

Live demo: https://cdn.rawgit.com/cyborgyl/Project6-DeferredShader/master/index.html

SSAO may not work properly using Chrome

![diffuse](/Results/diffuse.PNG)

Blinn-Phong

![toon](/Results/toon.PNG)

Toon Shading

![ssao](/Results/diffuse_ssao.PNG)

SSAO 

![bloom](/Results/bloom_ssao.PNG)

Bloom + SSAO

![bloom](/Results/toon_bloom_ssao.PNG)

Toon + Bloom + SSAO

-------------------------------------------------------------------------------
OVERVIEW:
-------------------------------------------------------------------------------
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
* 0 - Blinn-Phong
* 5 - Toon
* 6 - SSAO toggle
* 7 - Bloom toggle
There are also mouse controls for camera rotation.

-------------------------------------------------------------------------------
REQUIREMENTS:
-------------------------------------------------------------------------------
Features:
* Either of the following effects
  * Bloom
  * "Toon" Shading (with basic silhouetting)
* Screen Space Ambient Occlusion
* Diffuse and Blinn-Phong shading
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
README
-------------------------------------------------------------------------------
All students must replace or augment the contents of this Readme.md in a clear 
manner with the following:

* A brief description of the project and the specific features you implemented.
* At least one screenshot of your project running.
* A 30 second or longer video of your project running.  To create the video you
  can use [Open Broadcaster Software](http://obsproject.com) 
* A performance evaluation (described in detail below).

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
Always 60fps steady using "suzanne" model.

ACKNOWLEDGEMENTS
---
Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).

SSAO tutorial:
http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html

