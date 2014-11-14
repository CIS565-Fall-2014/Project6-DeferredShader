CIS 565 project 06 : Deferred shader
===================

## INTRODUCTION

This project is an implementation of an OpenGL/GLSL deferred shading pipeline. First, various maps are rendered out to G-buffers, including positions, normals, colors, and depths for the visible fragments. Lighting and post-processing effects are then computed using the information stored in these G-buffers. In this project, I explore multiple shading models, screen-space ambient occlusion, a toon shader, and a bloom effect.

## G-BUFFERS

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_gbuffer_positions.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_gbuffer_normals.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_gbuffer_colors.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_gbuffer_depths.PNG)

## LAMBERTIAN SHADING

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_lambertian.PNG)

## BLINN-PHONG SHADING

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_blinn_phong.PNG)

## SCREEN-SPACE AMBIENT OCCLUSION

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_ao.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_blinn_phong.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_blinn_phong_with_ao.PNG)

## HORIZON-BASED AMBIENT OCCLUSION

*Coming soon!*

## TOON SHADING

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_toon_01.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_toon_02.PNG)

## BLOOM

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_bloom_01.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_bloom_02.PNG)

![alt tag](https://raw.githubusercontent.com/drerucha/Project6-DeferredShader/master/readme_images/monkey_bloom_03.PNG)

## PERFORMANCE ANALYSIS

*Coming soon!*

*Note: As of 2014-11-13, I was having difficulties using WebGL Inspector and the Web Tracing Framework to time the execution of my shaders. Until I discover a workaround or an alternate tool to test performance, this section remains in-progress.*

## SPECIAL THANKS

I want to give a quick shout-out to Patrick Cozzi who led the fall 2014 CIS 565 course at Penn, Harmony Li who was the TA for the same course, and Cheng-Tso Lin who wrote much of the basecode. Thanks guys!

Also, this project makes use of three.js, so thanks to the guys and gals responsible for that.