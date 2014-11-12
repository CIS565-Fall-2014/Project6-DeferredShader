# Deferred Shading

Here are some results from my WebGL Deferred Shader

-Blinn Phong Lighting

![diffuse][diffuse]

I'm using this as my base line for performance comparison.

-Toon Shading

This is actually simpler in a way than Blinn-Phonng but I do have to do a brute force check for edges.  This is linear time with the size of the image, so the performance hit is not substantial.

+- 0 ms

![toon][toon]

-Bloom Shading

Very similar to edge detection, so the performance hit is not noticeable.

+- 0 ms

![bloom][bloom]

-Pixel Art Shading

The simplest in terms of computation.  It simply floors pixel coordinates to give a tiled effect.

+- 0 ms

![pixel][pixel]

[bloom]:https://raw.githubusercontent.com/jeremynewlin/Project6-DeferredShader/master/bloom.png
[toon]:https://raw.githubusercontent.com/jeremynewlin/Project6-DeferredShader/master/toon.png
[diffuse]:https://raw.githubusercontent.com/jeremynewlin/Project6-DeferredShader/master/diffuse.png
[pixel]:https://raw.githubusercontent.com/jeremynewlin/Project6-DeferredShader/master/pixel.png