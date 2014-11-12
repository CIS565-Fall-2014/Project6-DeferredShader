CIS 565 Project 6: Deferred Shader
==================================

* Kai Ninomiya (Arch Linux, Intel i5-2410M)
    (Performance numbers taken on Intel i5-4670, GTX 750)


Keys
----

* 1: View space positions
* 2: View space normals
* 3: Albedo color
* 4: Depth
* 0: Deferred render, reset to diffuse+specular only
  * 6: Disable/enable diffuse+specular
  * 7: Enable/disable bloom
  * 8: Enable/disable toon
  * 9: Disable/enable SSAO


References
----------

* John Chapman's SSAO implementation notes
    http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html


Starter Code Acknowledgements
-----------------------------

Many thanks to Cheng-Tso Lin, whose framework for CIS700 we used for this
assignment.

This project makes use of [three.js](http://www.threejs.org).
