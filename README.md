CIS 565 Project 6: Deferred Shader
==================================

* Kai Ninomiya (Arch Linux, Intel i5-2410M)

### [Live Demo](https://kainino0x.github.io/Project6-DeferredShader/)

Demo image with bloom and SSAO enabled:

![](images/bloom_ssao.png)


Interface
---------

* WASDRF: Fly
* Mouse or arrow keys: rotate camera
* 1: View space positions
* 2: View space normals
* 3: Albedo color
* 4: Depth
* 0: Deferred render, reset to diffuse+specular only
  * 6: Disable/enable diffuse+specular
  * 7: Enable/disable bloom
  * 8: Enable/disable toon
  * 9: Disable/enable SSAO


Effects
-------

### Diffuse & Specular lighting

TODO

![](images/diffuse.png)


### Bloom effect

TODO

![](images/bloom.png)


### Toon shading

TODO

![](images/toon.png)


### Screen-Space Ambient Occlusion

TODO

![](images/with_ssao.png)


Performance
-----------

### Runtime Switches

| Effects               | Frame time |
|:--------------------- | ----------:|
| No shading            |    10.5 ms |
| Diffuse+specular only |    10.5 ms |
| Bloom only            |    80.0 ms |
| Toon only             |    10.5 ms |
| SSAO only             |    14.5 ms |
| Bloom & SSAO          |    84.5 ms |


### Compile-Time Switches

| Effects               | Frame time |
|:--------------------- | ----------:|
| No shading            |     9.0 ms |
| Diffuse+specular only |    10.5 ms |
| Bloom only            |    78.5 ms |
| Toon only             |     9.5 ms |
| SSAO only             |    14.0 ms |
| Bloom & SSAO          |    83.5 ms |


References
----------

[1] John Chapman's SSAO implementation notes.
    http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html

[2] stats.js. Copyright 2009-2012 Mr.doob. Used under MIT License.
    https://github.com/mrdoob/stats.js


Starter Code Acknowledgements
-----------------------------

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
