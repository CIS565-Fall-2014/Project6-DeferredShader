======================================
CIS565: Project 6 -- Deferred Shader
======================================
Fall 2014 <br />
Bo Zhang<br />

##OVERVIEW:
This is a WebGL project based on implementation of deferred shader.

##Result:
### 1)Diffuse and Blinn-Phong shading<br />
This part is simple as I have finished Blinn-Phong shader in project4.<br />
* Reference Link: http://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model<br />
* Here is the result of Diffuse and Blinn-Phong shading:<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/BlinnPhong.bmp)

### 2)Bloom<br />
Bloom shading makes objects appear to glow. To do this, I use the Blinn-Phong shader color as orginal color and then used a gaussian convolution to add glow on it.<br />
* Reference Link: http://prideout.net/archive/bloom/<br />
* Here is the result of Bloom shading:<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/Bloom.bmp)

### 3)"Toon" Shading (with basic silhouetting)
To do Toon Shader, I just assign different color to screen points according to the dot product of light direction and screen point normal. And to add silhouette, I tried two different methonds. The first one is to compare the screen point's normal to nearby normals. If the dot product of point's normal and nearby normal is close to 1, I assign edge color(black) to this screen point. And the second one is to compare depth. If the screen point is near to background, I assigh edge color to it.
* Reference Link: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/<br />
* Here is the result of Toon shading(with buggy silhouetting):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/ToonBuggy.bmp)
<br />
* Here is the result of Toon shading(with right silhouetting):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/Toon%20Right.bmp)<br />

### 4)Screen Space Ambient Occlusion

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
The performance evaluation is where you will investigate how to make your 
program more efficient using the skills you've learned in class. You must have
performed at least one experiment on your code to investigate the positive or
negative effects on performance. 

We encourage you to get creative with your tweaks. Consider places in your code
that could be considered bottlenecks and try to improve them. 

Each student should provide no more than a one page summary of their
optimizations along with tables and or graphs to visually explain any
performance differences.

-------------------------------------------------------------------------------
THIRD PARTY CODE POLICY
-------------------------------------------------------------------------------
* Use of any third-party code must be approved by asking on the Google groups.  
  If it is approved, all students are welcome to use it.  Generally, we approve 
  use of third-party code that is not a core part of the project.  For example, 
  for the ray tracer, we would approve using a third-party library for loading 
  models, but would not approve copying and pasting a CUDA function for doing 
  refraction.
* Third-party code must be credited in README.md.
* Using third-party code without its approval, including using another 
  student's code, is an academic integrity violation, and will result in you 
  receiving an F for the semester.

-------------------------------------------------------------------------------
SELF-GRADING
-------------------------------------------------------------------------------
* On the submission date, email your grade, on a scale of 0 to 100, to Harmony,
  harmoli+cis565@seas.upenn.edu, with a one paragraph explanation.  Be concise and 
  realistic.  Recall that we reserve 30 points as a sanity check to adjust your 
  grade.  Your actual grade will be (0.7 * your grade) + (0.3 * our grade).  We 
  hope to only use this in extreme cases when your grade does not realistically 
  reflect your work - it is either too high or too low.  In most cases, we plan 
  to give you the exact grade you suggest.
* Projects are not weighted evenly, e.g., Project 0 doesn't count as much as 
  the path tracer.  We will determine the weighting at the end of the semester 
  based on the size of each project.


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
