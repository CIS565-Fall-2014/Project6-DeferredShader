------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------
RESULTS:
-------------------------------------------------------------------------------

* Diffuse and Blinn-Phong shading

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled6.png)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled2.png)

* Bloom

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled7.png)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled3.png)

* "Toon" Shading (with normal based silhouetting)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled8.png)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled4.png)

* Screen Space Ambient Occlusion

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled5.png)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/Untitled1.png)

-------------------------------------------------------------------------------
CONTROLS:
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
* 5 - Bloom
* 6 - Toon Shading
* 7 - SSAO
* 0 - Full deferred pipeline

-------------------------------------------------------------------------------
PERFORMANCE:
-------------------------------------------------------------------------------

I did some test for Bloom and SSAO effect with different samples number. For the Bloom effect the fps drop very quickly with the samples number increasing.
I think it will be better to separate this step into two passes, which will greatly benefit the efficiency.
 
![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/image.png)

![](https://github.com/DiracSea3921/Project6-DeferredShader/blob/master/image2.png)

-------------------------------------------------------------------------------
REFERENCES:
-------------------------------------------------------------------------------

* Bloom : [GPU Gems](http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html) 
* Screen Space Ambient Occlusion : (http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html)

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


---
SUBMISSION
---
As with the previous projects, you should fork this project and work inside of
your fork. Upon completion, commit your finished project back to your fork, and
make a pull request to the master repository.  You should include a README.md
file in the root directory detailing the following

* A brief description of the project and specific features you implemented
* At least one screenshot of your project running.
* A link to a video of your project running.
* Instructions for building and running your project if they differ from the
  base code.
* A performance writeup as detailed above.
* A list of all third-party code used.
* This Readme file edited as described above in the README section.

---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
