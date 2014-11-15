------------------------------------------------------------------------------
CIS565: Project 6 -- Deferred Shader
-------------------------------------------------------------------------------
Fall 2014
-------------------------------------------------------------------------------
Jiatong He
-------------------------------------------------------------------------------

![sample render](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/sponza_composite.jpg)

Implemented several features into a skeleton deferred shader pipeline in webGL.

###Implemented Features
#### Diffuse + Blinn-Phong Shading
![diffuse + blinn-phong](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_diff.jpg)
Implemented diffuse and blinn-phong shading.

#### Toon Shading + Silhouetting
![toon + border](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_toonborder.jpg)
Implemented a toon shader by clamping the diffuse+specular term to some value.  The values I chose were ones I saw several times online, and seem to work well.

![border](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_border.jpg)
Silhouetting is a little hacky in this implementation.  I do it post-processing, by reading a depth value in the shade texture that I saved as the alpha channel.  If the current fragment has a fragment close by that is closer to the camera, the current fragment color is set to black.  This way, outlines don't overlay on the object they're outlining.

#### Screen Space Ambient Occlusion
![ao10](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_ao10.jpg)
I cheated a little with this one as well.  Instead of pseudorandomly sampling a sphere/hemisphere around the point, I take a grid sample of the adjacent points along the tangent plane, and check if the saved depth at those fragments are in front of or behind the plane.  The results come out pretty convincing, but it's definitely not faster than hemisphere sampling.
![ao1](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_ao1.jpg)
Radius 1 (~9 samples)
![ao5](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_ao5.jpg)
Radius 5 (~121 samples)
![ao10](https://raw.githubusercontent.com/JivingTechnostic/Project6-DeferredShader/master/images/suz_ao10.jpg)
Radius 10 (>400 samples)
![ao20](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/suz_ao20.jpg)
Radius 20 (>1600 samples)

#### Bloom
![bloom](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/suz_bloom.jpg)
Simple bloom effect using a simplified version of the method described at (http://kalogirou.net/2006/05/20/how-to-do-good-bloom-for-hdr-rendering/).
The process is as follows:
* take a brightpass of the image
* blur the brightpass
* add it back into the image
My implementation takes a weighted sampling of the neighboring fragments and processes them accordingly to get the blurred brightpass.  The effect looks pretty good:
![no bloom](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/suz_diff.jpg)
No Bloom
![bloom](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/suz_diffaobloom.jpg)
+Bloom

#### Optimized g-buffer
![orig g](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/old-g.jpg)

Original g-buffer
In order to compress the g-buffer and reduce memory reads, I took note of the following:
* The alpha channel on the color is never used (this will change if I do further work on this, but it's fine for now for performance tests)
* An alternative depth value can be calculated with the z value of position.
* The normal can be reconstructed from the x and y components.
* The alpha channel on the position texture is never used.

With these in mind, I made the following changes to the g-buffer:
![new g](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/new-g.jpg)

And split the normal across the color and position textures.  This cuts down the number of textures from four to two.

#####Performance Change
Unfortunately, the performance appears to be unimpacted by the change.  After looking at my code, I have some ideas as to why:
* Because I do a plane-based AO, I never actually used the depth buffer.  Instead, I calculated my own depth equivalent using position.z.  As a result, removing the depth buffer didn't have much of an impact.
* Only the local normals are ever used.  Splitting it into the other buffers saves at most 1 memory read, and it's definitely not the bottleneck at the moment.
I ran the most of the combinations of effects with both g-buffer types, and the results were nearly equal.
![g perf](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/runtime_gbuffer.jpg)
With all the effects active, there is a slight improvement in performance, but it's not significant.  Note that these are also estimates so they may be slightly off.

###Flaws
* Cannot process materials with transparency.
* User cannot control the image output.
* everything

###Performance
It's easy to tell where the performance problems are.  AO, silhouetting, and bloom all involve loops that sample the appropriate textures several times each.  The number of samples is determined by a sample radius, and is equal to (1 + 2 * radius)^2.  This is because I currently sample every single fragment within a square defined by that radius, which means that increasing the radius results in a n^2 increase in runtime for that single effect.

![ao perf](https://github.com/JivingTechnostic/Project6-DeferredShader/blob/master/images/runtime_AO.jpg)
You can see the changes in runtime due to increase in radius (quadratic increase in number of samples taken)

An alternative implementation is to use a pseudorandom number generator to take a set number of random samples within some radius.  However, this method will likely require a separate convolution of the results (since the random samples may be unreliable), which means another step in the render pipeline.

---
ACKNOWLEDGEMENTS
---

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
