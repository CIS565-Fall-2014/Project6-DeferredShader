======================================
CIS565: Project 6 -- Deferred Shader
======================================
Fall 2014 <br />
Bo Zhang<br />

##Overview:
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
To do Toon Shader, I just assign different color to screen points according to the dot product of light direction and screen point normal. And to add silhouette, I tried two different methonds. The first one is to compare the screen point's normal to nearby normals. If the dot product of point's normal and nearby normal is close to 1, I assign edge color(black) to this screen point. And the second one is to compare depth. If the screen point is near to background, I assigh edge color to it.<br />
* Reference Link: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/<br />
* Here is the result of Toon shading(with buggy silhouetting):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/ToonBuggy.bmp)
<br />
* Here is the result of Toon shading(with right silhouetting):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/Toon%20Right.bmp)<br />

### 4)Screen Space Ambient Occlusion
Ambient occlusion is an approximation of the amount by which a point on a surface is occluded by the surrounding geometry, which affects the accessibility of that point by incoming light. To do this, I generates 100 direction samples in the hemisphere of the normal for each screen point. I use the samples to check whether the incoming rays occluded. And then I use the occlusion factor(the percentage of the rays that are occluded) as rgb for the point's color. Besides, I also use rangeCheck to prevent erroneous occlusion between large depth discontinuities.<br />
* Reference Link: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html<br /><br />
* Here is the result of SSAO(without rangeCheck):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/WithoutRangeCheck.bmp)
<br />
* Here is the result of SSAO(with rangeCheck):<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/WithRangeCheck.bmp)<br />

### 5)Blur According To Depth
I implement this as an additional post processing effects. I implement a simple blur shader and blur the points' color according to their depth. And here is the result, we can see the farther the object is, the more it will be blurred.<br />

![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/Blur.bmp)<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/Blur2.bmp)<br />

##Some Other Buggy Images
Here is the result I get when I pass wrong random kernels for SSAO:<br />
![Alt text](https://github.com/wulinjiansheng/Project6-DeferredShader/blob/master/Pics/wrong.bmp)<br />

##Performance Evaluation
Feature | FPS
----- | ----- 
Blinn-Phong | 6 FPS 
Bloom | 6 FPS 
Toon | 6 FPS 
SSAO| 6 FPS
Blur | 6 FPS

The FPS drops down greatly when I use my self-defined shaders. I don't know why it happens and why all features are 6 FPS(I think Bloom and SSAO shaders should have lower FPS as they have more samples). Maybe main reason is that my browser doesn't support drawbuffers. 

-------------------------------------------------------------------------------
##Keyboard Controls
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
* 5 - Toon
* 6 - Bloom
* 7 - Blinn-Phong
* 8 - SSAO
* 9 - Blur

There are also mouse controls for camera rotation.

Personal Link
-------------------------------------------------------------------------------
https://www.youtube.com/watch?v=Dg5RBjwsi0w <br />

Web Page
-------------------------------------------------------------------------------
http://wulinjiansheng.github.io/Project6-DeferredShader/
