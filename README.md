CIS 565 Project6 : Deferred Shader
===================

Fall 2014

Author: Dave Kotfis

[Click Here For A Demo](http://dkotfis.github.io/Project6-DeferredShader/index.html)

##Overview

This project features special rendering effects that can be performed efficiently through a deferred shading pipeline using WebGL. Effects include Toon Shading, Bloom Shading, and Screen Space Ambient Occlusion.

The pipeline involves an initial pass to create the geometry buffer (g-buffer) consisting of positions, normals, material color, and depth. Then, a shading pass is performed that uses blinn-phong shading (or diffuse only). Finally, a third pass is used for additional special effects. An alternate diagnostic pass can be used to render the g-buffer for debug purposes.

The result with diffuse shading only with no added effects looks like this:

![Diffuse Only] (renders/diffuse.png)

##Toon Shading

Toon Shading makes the render look cartoonish, where only a few discrete shades of color are used, and the edges of objects have thick, pencil-drawn borders. I implemented this in the post processing shader by first quantizing the color shade into a discrete number of colors. I then detected edges by using a high pass filter (subtracting out blur) on the depth buffer. I draw anything with a edge score above a certain threshold as black.

![Toon Shading] (renders/toon.png)

##Bloom Shading

Bloom shading can make materials appear to glow. It does this by taking a luminosity texture to create a glow buffer, then blur the glow. For a single object, I treated the entire thing as glowing, which allowed me to use the original material color in the g-buffer as the glow buffer. I then used a gaussian convolution on this glow and added it to the original color.

![Bloom Shading] (renders/bloom.png)

##Screen Space Ambient Occlusion

Inspired by the Crytek approach, I implemented SSAO by generating 100 direction samples in the hemisphere of the normal of each point. These are scaled to prioritize shorter radius samples. These samples are used to check nearby points to see if casting a ray would collide with the surface and fail the depth test. The occlusion factor is the percentage of the rays that are occluded. Here are comparison images of a scene without and with SSAO. Notice the shaded areas such as the ears and mouth.

![Without SSAO] (renders/no-ao.png)
![SSAO] (renders/with-ao.png)

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
* 5 - No Effects (Blinn-Phong Only)
* 6 - Toon Shading
* 7 - Screen Space Ambient Occlusion
* 8 - Bloom Shading
* 0 - Full deferred pipeline

There are also mouse controls for camera rotation.

