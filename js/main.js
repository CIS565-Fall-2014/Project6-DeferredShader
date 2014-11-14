// Written by Harmony Li. Based on Cheng-Tso Lin's CIS 700 starter engine.
// CIS 565 : GPU Programming, Fall 2014.
// University of Pennsvylania (c) 2014.

// Global Variables
var canvas;     // Canvas DOM Element
var gl;         // GL context object
var camera;     // Camera object
var interactor; // Camera interaction object
var objloader;  // OBJ loader

// Models 
var model;      // Model object
var quad = {};  // Empty object for full-screen quad

// Framebuffer
var fbo = null;
var fbo2 = [];

// Shader programs
var passProg;     // Shader program for G-Buffer
var shadeProg;    // Shader program for P-Buffer
var diagProg;     // Shader program from diagnostic 
var postProg;     // Shader for post-process effects
var forwardProg;   //forward shader

// Multi-Pass programs
var posProg;
var normProg;
var colorProg;

var isDiagnostic = false;
var zNear = 20.0;
var zFar = 2000.0;
var deferredRender = true;
var texToDisplay = 0;
var modelToLoad = 1;   //0=suzanne, 1=village, 2=teapot,3= suzanne&friends,4=sponza
var earlyZ = 0;   //0=none, 1=sort, 2=zprepass 

var lightcolor;
var lightdir;
var diffusecolor;


//var FILTER_NUM = 4;
var kernel = [];
//var kernel2 = [];
var kernel3 = [];
var kernel4 = [];
var filter0 = [];
var filter1 = [];
var bloomTex;
var noiseTex;

var mvpMat;
var nmlMat;


var numFramesToAverage = 16;
var frameTimeHistory = [];
var frameTimeIndex = 0;
var totalTimeForFrames = 0;
var then = Date.now() / 1000;


var main = function (canvasId, messageId) {

  var canvas;

  // Initialize WebGL
  initGL(canvasId, messageId);

  //initialize GUI
  initGUI();

  // Set up camera
  initCamera(canvas);

  // Set up FBOs
  initFramebuffer();

  // Set up models
  initObjs();

  // init kernel
  initKernel();

  // init filters for bloom
 // initFilters();

  // Set up shaders
  initShaders();
  initShadersForward();

  // Register our render callbacks
  CIS565WEBGLCORE.render = render;
  CIS565WEBGLCORE.renderLoop = renderLoop;

  // Start the rendering loop
  CIS565WEBGLCORE.run(gl);
};


var renderLoop = function () {

	var now = Date.now() / 1000;  
    var elapsedTime = now - then;
    then = now;

    // update the frame history.
    totalTimeForFrames += elapsedTime - (frameTimeHistory[frameTimeIndex] || 0);
    frameTimeHistory[frameTimeIndex] = elapsedTime;
    frameTimeIndex = (frameTimeIndex + 1) % numFramesToAverage;

    // compute fps
    var averageElapsedTime = totalTimeForFrames / numFramesToAverage;
    var fps = 1 / averageElapsedTime;
    //document.getElementById("fps").innerText = fps.toFixed(0); 
	$('#fps').html(fps.toFixed(0));
	
  window.requestAnimationFrame(renderLoop);
  render();
};

var render = function () {
  if(deferredRender){
	  if (fbo.isMultipleTargets()) {
		renderPass();
	  } else {
		renderMulti();
	  }

	  if (!isDiagnostic) {
		renderShade();
		renderPost();
	  } else {
		renderDiagnostic();
	  }
  }
  else{
	renderForward();
  }

  gl.useProgram(null);
  
};

function initializeTexture(texture, src) {
  texture.image = new Image();
  texture.image.onload = function() {
    initLoadedTexture(texture);

  }
  texture.image.src = src;
}



function initLoadedTexture(texture){
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
}


var drawModel = function (program, mask) {
	if(earlyZ == 1){   //sort geometry
//	for(var i = 0; i < model.numGroups(); i++) {
//	}
		
	}
  // Bind attributes
  for(var i = 0; i < model.numGroups(); i++) {
    if (mask & 0x1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.vbo(i));
      gl.vertexAttribPointer(program.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.aVertexPosLoc);
    }

    if (mask & 0x2) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.nbo(i));
      gl.vertexAttribPointer(program.aVertexNormalLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.aVertexNormalLoc);
    }

     if (mask & 0x4) {
    //  gl.bindBuffer(gl.ARRAY_BUFFER, model.tbo(i));
    //  gl.vertexAttribPointer(program.aVertexTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
    //  gl.enableVertexAttribArray(program.aVertexTexcoordLoc);
    }


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ibo(i));
    gl.drawElements(gl.TRIANGLES, model.iboLength(i), gl.UNSIGNED_SHORT, 0);
  }
 //console.log ("model number of indices: " + model.iboLength(0));
  if (mask & 0x1) gl.disableVertexAttribArray(program.aVertexPosLoc);
  if (mask & 0x2) gl.disableVertexAttribArray(program.aVertexNormalLoc);
  if (mask & 0x4) gl.disableVertexAttribArray(program.aVertexTexcoordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

var drawQuad = function (program) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
  gl.vertexAttribPointer(program.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.tbo);
  gl.vertexAttribPointer(program.aVertexTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexTexcoordLoc);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.ibo);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
 
  gl.disableVertexAttribArray(program.aVertexPosLoc);
  gl.disableVertexAttribArray(program.aVertexTexcoordLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

var renderPass = function () {
  // Bind framebuffer object for gbuffer
  fbo.bind(gl, FBO_GBUFFER);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(passProg.ref());
  mvpMat = mat4.create();
  mat4.multiply( mvpMat, persp, camera.getViewTransform() );
  nmlMat = mat4.create();
  mat4.invert( nmlMat, camera.getViewTransform() );
  mat4.transpose( nmlMat, nmlMat);

  gl.uniformMatrix4fv( passProg.uModelViewLoc, false, camera.getViewTransform());        
  gl.uniformMatrix4fv( passProg.uMVPLoc, false, mvpMat );        
  gl.uniformMatrix4fv( passProg.uNormalMatLoc, false, nmlMat );  
  gl.uniform3fv(passProg.uDiffuseColorLoc, diffusecolor)

  /*gl.activeTexture( gl.TEXTURE5 );  //texture
  //gl.bindTexture( gl.TEXTURE_2D, model.texture(0) );
  gl.bindTexture(gl.TEXTURE_2D, testTex);
  gl.uniform1i(passProg.uSamplerLoc, 5);     */

  drawModel(passProg, 0x3);

  // Unbind framebuffer
  fbo.unbind(gl);
};

var renderMulti = function () {
  fbo.bind(gl, FBO_GBUFFER_POSITION);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(posProg.ref());
 
  //update the model-view matrix
  var mvpMat = mat4.create();
  mat4.multiply( mvpMat, persp, camera.getViewTransform() );

  gl.uniformMatrix4fv( posProg.uModelViewLoc, false, camera.getViewTransform());        
  gl.uniformMatrix4fv( posProg.uMVPLoc, false, mvpMat );

  drawModel(posProg, 1);

  gl.disable(gl.DEPTH_TEST);
  fbo.unbind(gl);
  gl.useProgram(null);

  fbo.bind(gl, FBO_GBUFFER_NORMAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(normProg.ref());

  //update the normal matrix
  var nmlMat = mat4.create();
  mat4.invert( nmlMat, camera.getViewTransform() );
  mat4.transpose( nmlMat, nmlMat);
  
  gl.uniformMatrix4fv(normProg.uMVPLoc, false, mvpMat);
  gl.uniformMatrix4fv(normProg.uNormalMatLoc, false, nmlMat);

  drawModel(normProg, 3);

  gl.useProgram(null);
  fbo.unbind(gl);

  fbo.bind(gl, FBO_GBUFFER_COLOR);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(colorProg.ref());

  gl.uniformMatrix4fv(colorProg.uMVPLoc, false, mvpMat);
  gl.uniform3fv(colorProg.uDiffuseColorLoc, diffusecolor);

  drawModel(colorProg, 1);

  gl.useProgram(null);
  fbo.unbind(gl);
};

var renderShade = function () {
  gl.useProgram(shadeProg.ref());
  gl.disable(gl.DEPTH_TEST);

  // Bind FBO
  fbo.bind(gl, FBO_PBUFFER);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind necessary textures
  gl.activeTexture( gl.TEXTURE0 );  //position
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(0) );
  gl.uniform1i( shadeProg.uPosSamplerLoc, 0 );

  gl.activeTexture( gl.TEXTURE1 );  //normal
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(1) );
  gl.uniform1i( shadeProg.uNormalSamplerLoc, 1 );


  gl.activeTexture( gl.TEXTURE2 );  //color
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(2) );
  gl.uniform1i( shadeProg.uColorSamplerLoc, 2 );

  gl.activeTexture( gl.TEXTURE3 );  //depth
  gl.bindTexture( gl.TEXTURE_2D, fbo.depthTexture() );
  gl.uniform1i( shadeProg.uDepthSamplerLoc, 3 );

  gl.activeTexture( gl.TEXTURE5);   //noise
  gl.bindTexture( gl.TEXTURE_2D, noiseTex );
  gl.uniform1i(shadeProg.uNoiseSamplerLoc,5);

  /*gl.activeTexture( gl.TEXTURE4 );  //light
  gl.bindTexture( gl.TEXTURE_2D, lightPosTex);
  //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, lightPosArray.length/3, 1.0, 0, gl.RGB, gl.FLOAT, new Float32Array(lightPosition));
  gl.uniform1i( shadeProg.uLightPosTexLoc, 4 );*/

  gl.uniform1fv(shadeProg.uKernelLoc3, kernel3);
  gl.uniform1f(shadeProg.uOffsetLoc, 1.0 / canvas.width);
  gl.uniform1f(shadeProg.uOffsetLoc2, 1.0 / canvas.height);
  gl.uniformMatrix4fv( shadeProg.uPerspMatLoc, false, persp);


  // Bind necessary uniforms 
  gl.uniform1f( shadeProg.uZNearLoc, zNear );
  gl.uniform1f( shadeProg.uZFarLoc, zFar );
  gl.uniform1i( shadeProg.uDisplayTypeLoc, texToDisplay ); 

  vec3.normalize(lightdir, lightdir);
  vec3.transformMat4 (lightdir, lightdir, camera.getViewTransform());
  vec3.normalize(lightdir, lightdir);
  gl.uniform3fv(shadeProg.uLightDirLoc,lightdir);

  gl.uniform3fv(shadeProg.uLightColorLoc, lightcolor);
  gl.uniform3fv(shadeProg.uEyePosLoc, camera.getEyePosition());
  gl.uniform3fv(shadeProg.uViewDirLoc, camera.getViewDirection());

  drawQuad(shadeProg);

  // Unbind FBO
  fbo.unbind(gl);
};

var renderDiagnostic = function () {
  gl.useProgram(diagProg.ref());

  gl.disable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind necessary textures
  gl.activeTexture( gl.TEXTURE0 );  //position
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(0) );
  gl.uniform1i( diagProg.uPosSamplerLoc, 0 );

  gl.activeTexture( gl.TEXTURE1 );  //normal
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(1) );
  gl.uniform1i( diagProg.uNormalSamplerLoc, 1 );

  gl.activeTexture( gl.TEXTURE2 );  //color
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(2) );
  gl.uniform1i( diagProg.uColorSamplerLoc, 2 );

  gl.activeTexture( gl.TEXTURE3 );  //depth
  gl.bindTexture( gl.TEXTURE_2D, fbo.depthTexture() );
  gl.uniform1i( diagProg.uDepthSamplerLoc, 3 ); 

  // Bind necessary uniforms 
  gl.uniform1f( diagProg.uZNearLoc, zNear );
  gl.uniform1f( diagProg.uZFarLoc, zFar );
  gl.uniform1i( diagProg.uDisplayTypeLoc, texToDisplay ); 

  
  drawQuad(diagProg);
};


var renderPost = function () {
  gl.useProgram(postProg.ref());

  gl.disable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind necessary textures
  gl.activeTexture( gl.TEXTURE4 );
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(4) );
  gl.uniform1i(postProg.uShadeSamplerLoc, 4 );


  /*gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, filter1[0]);
  gl.uniform1i(postProg.uBloomSamplerLoc0,5);

  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_2D, filter1[1]);
  gl.uniform1i(postProg.uBloomSamplerLoc1,6);

  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, filter1[2]);
  gl.uniform1i(postProg.uBloomSamplerLoc2,7);

  gl.activeTexture(gl.TEXTURE8);
  gl.bindTexture(gl.TEXTURE_2D, filter1[3]);
  gl.uniform1i(postProg.uBloomSamplerLoc3,8);*/

  //gl.uniform1fv(postProg.uKernelLoc, 5*5, kernel);   //pass in the 5*5 kernel
  gl.uniform1fv(postProg.uKernelLoc, kernel);   //pass in the 5*5 kernel
  //gl.uniform1fv(postProg.uKernel2Loc, kernel2);   //pass in the 21*21 kernel
  //console.log(kernel3);

  gl.uniform1f(postProg.uOffsetLoc, 1.0 / canvas.width);
  gl.uniform1f(postProg.uOffsetLoc2, 1.0 / canvas.height);
  gl.uniform1i( postProg.uDisplayTypeLoc, texToDisplay ); 
  gl.uniformMatrix4fv( postProg.uPerspMatLoc, false, persp);

  drawQuad(postProg);
};


var renderForward = function(){
//console.log("forward rendering");
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
   // gl.disable(gl.DEPTH_TEST);
 
  gl.useProgram(forwardProg.ref());

  
  gl.uniformMatrix4fv( forwardProg.uModelViewMatLoc, false, camera.getViewTransform());    
  gl.uniformMatrix4fv( forwardProg.uPerspMatLoc, false, persp);   
  
  drawModel(forwardProg,0x3);
  
  // Bind attributes
  /*for(var i = 0; i < model.numGroups(); i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vbo(i));
    gl.vertexAttribPointer(forwardProg.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(forwardProg.aVertexPosLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.nbo(i));
    gl.vertexAttribPointer(forwardProg.aVertexNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(forwardProg.aVertexNormalLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ibo(i));
    gl.drawElements(gl.TRIANGLES, model.iboLength(i), gl.UNSIGNED_SHORT, 0);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);*/
  
  //console.log("forward rendering end");
};


var initKernel = function(){   //normalize kenel
  kernel = [
    1, 4, 6, 4, 1,
    4, 16, 24, 16, 4,
    6, 24, 36, 24, 6,
    4, 16, 24, 16, 4,
    1, 4, 6, 4, 1,
  ];
  var sum = 0;
  for(var i=0; i< 5*5; i++){
    sum += kernel[i];
  }
   for(var i=0; i< 5*5; i++){
    kernel[i] /= sum;
  }

/*
  var sigma = 5.0;
  var sum2 = 0.0;
  var m = 21.0;
  var n = 21.0;
  for(var i = 0; i<= m-1; i++){
      for(var j = 0; j<= n-1; j++){
        var h1 = i -(m-1.0)/2.0;
        var h2 = j -(n-1.0)/2.0;
        var tmp = 0.5*Math.exp(-Math.pow(h1,2.0)-Math.pow(h2,2.0)) / Math.pow(sigma,2.0);
        kernel2[i*m+j] = tmp;
        sum2 += tmp;
      }
    }

  for(var i = 0; i<= m-1; i++){
      for(var j = 0; j<= n-1; j++){
        kernel2[i*m+j] /= sum2;
      }
    }*/
   // console.log("kernel 2 init: " + kernel2.length);
  //console.log(kernel);
  //console.log(kernel2);

  //kernels is random heimisphere sample
  var scale;
  var len;
  for (var i = 0; i < 16; ++i) {
    //sample points on hemisphere oriented along the z axis
     scale = i / 4.0;
     scale = lerp(0.1, 1.0, scale * scale);  //distance weighted
   
     kernel3[i*3 + 0] = ((Math.random() * 2.0) -1.0)*scale;   //[-1,1]
     kernel3[i*3 + 1] = ((Math.random() * 2.0) -1.0)*scale;   //[-1,1]
     kernel3[i*3 + 2] = Math.random()*scale;  //[0,1]

     //normallize
     len = Math.sqrt(kernel3[i*3 + 0] *kernel3[i*3 + 0]  + kernel3[i*3 + 1] *kernel3[i*3 + 1]  + kernel3[i*3 + 2] *kernel3[i*3 + 2]);
     kernel3[i*3 + 0] /= len;
     kernel3[i*3 + 1] /= len;
     kernel3[i*3 + 2] /= len;
  }
  // console.log(kernel3);


  //noise kernel to  rotate the sample kernel used by AO
  //avoid banding effect
  for (var i = 0; i < 16; i++) {
     kernel4[i*3+0] = ((Math.random() * 2.0) -1.0);
     kernel4[i*3+1] = ((Math.random() * 2.0) -1.0);
     kernel4[i*3+2] = 0.0;

     //normallize
     len = Math.sqrt(kernel4[i*3 + 0] *kernel4[i*3 + 0]  + kernel4[i*3 + 1] *kernel4[i*3 + 1]  + kernel4[i*3 + 2] *kernel4[i*3 + 2]);
     kernel4[i*3 + 0] /= len;
     kernel4[i*3 + 1] /= len;
     kernel4[i*3 + 2] /= len;
  }

  var noiseArray = new Float32Array( kernel4 );
  noiseTex = gl.createTexture();
  createCustomTexture(noiseTex, noiseArray, gl.RGB, 16, 1);
  //console.log("noise array size:" + noiseArray.length/3);
  //console.log(noiseTex);
console.log("noise: "+kernel4);
};

var lerp = function(a, b, t) {
    return a + t * (b-a);
};


//create texture from data arrays
var createCustomTexture = function( textureName, dataArray, format, width, height ){
  gl.bindTexture(gl.TEXTURE_2D, textureName);
  //INVALID_OPERATION: texImage2D: ArrayBufferView not big enough for request   ???
  gl.texImage2D( gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.FLOAT, dataArray);    
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
 // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.bindTexture(gl.TEXTURE_2D, null);

};

var initFilters = function(){
  var w = canvas.width;
  var h = canvas.height;
  for(var i=0; i<FILTER_NUM; i++){
    filter0[i] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, filter0[i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, null);

    fbo2[i] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2[i]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, filter0[i], 0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log("init framebuffer failed at fbo2[" + i + "]");
    }

    filter1[i] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, filter1[i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, null);

    fbo2[FILTER_NUM + i] = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2[FILTER_NUM + i]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, filter1[i], 0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      console.log("init framebuffer failed at fbo2[" + FILTER_NUM + i + "]");
    }

    w /= 2; // w >> 1;
    h /= 2; //h >> 1;

  }

  console.log("successfully init " + FILTER_NUM+" filters");
}

var initGL = function (canvasId, messageId) {
  var msg;

  // Get WebGL context
  canvas = document.getElementById(canvasId);
  msg = document.getElementById(messageId);
  gl = CIS565WEBGLCORE.getWebGLContext(canvas, msg);

  if (!gl) {
    return; // return if a WebGL context not found
  }

  // Set up WebGL stuff
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  lightdir = vec3.fromValues(1.0,1.0,1.0);
  lightcolor = vec3.fromValues(1.0,1.0,1.0);
  diffusecolor = vec3.fromValues(1.0,0.0,0.0);
};


//  window.onload = function() {
 // }

  var ControllerText = function() {
    this.DebugShader = 'normal';
    this.AdvancedShader = 'lambert+AO';
    this.DiffuseColor = [ 255, 0,0 ]; // RGB array
	this.Near = 20;
	this.Far = 2000;
	this.ChangeModel = 'village';
	this.ChangeRender = 'deferred';
	this.Acceleration = 'none';
  };

var initGUI = function(){
    var cText = new ControllerText();
    var gui = new dat.GUI( );
	
	var modelController = gui.add(cText, 'ChangeModel',['village','suzanne','teapot','suzanne&friends','sponza']);
	var renderController = gui.add(cText, 'ChangeRender',['deferred','forward']);
	var f1 = gui.addFolder('DeferredShader');
	//var f2 = gui.addFolder('ForwardShader');
	f1.open();
	//f2.open();
	
    var debugShaderController = f1.add(cText, 'DebugShader',['normal','color','depth','position']);
    var advancedShaderController = f1.add(cText, 'AdvancedShader',['lambert+AO','lambert','blinn','bloom','toon','AO']);
	
	var diffuseColorController = gui.addColor(cText, 'DiffuseColor');
	var nearController =  gui.add(cText, 'Near', 2, 1000);
	var farController =  gui.add(cText, 'Far', 1000, 40000);
	//gui.remember(cText);
	
	renderController.onChange(function(value){
      if(value == 'deferred'){
			deferredRender = true;
	  }else{
	  		deferredRender = false;
			//initShadersForward();
			//initCamera();
	  }
    });
	nearController.onChange(function(value){
      zNear = parseFloat(value);
    });
	farController.onChange(function(value){
      zFar = parseFloat(value);
    });
    diffuseColorController.onChange(function(value){
      diffusecolor[0] = parseFloat(value[0])/255.0;
      diffusecolor[1] = parseFloat(value[1])/255.0;
      diffusecolor[2] = parseFloat(value[2])/255.0;
      console.log("diffuse color: " + diffusecolor);
    });
     diffuseColorController.onFinishChange(function(value) {
      console.log("diffuse color: " + diffusecolor);
     });

	 modelController.onChange(function(value){
		var previous = modelToLoad;
		if(value == 'suzanne')
			modelToLoad = 0;
		else if(value == 'village')
			modelToLoad = 1;
		else if(value == 'teapot')
			modelToLoad = 2;
		else if(value == 'suzanne&friends')
			modelToLoad = 3;
		else if(value == 'sponza')
			modelToLoad = 4;
			
			
		if(previous != modelToLoad){
			initObjs();
			//initShaders();
			CIS565WEBGLCORE.run(gl);
		}
		
	});
	
    debugShaderController.onChange(function(value){
      isDiagnostic = true;
      if(value=='position')
        texToDisplay = 1;
      else if(value == 'normal')
        texToDisplay = 2;
      else if(value == 'color')
        texToDisplay = 3;
      else if(value == 'depth')
        texToDisplay = 4;
   });
    advancedShaderController.onChange(function(value){
      isDiagnostic = false;
      if(value=='lambert')
        texToDisplay = 5;
      else if(value == 'blinn')
        texToDisplay = 6;
      else if(value == 'bloom')
        texToDisplay = 7;
      else if(value == 'toon')
        texToDisplay = 8;
      else if(value == 'AO')
        texToDisplay = 9;
	  else if(value == 'lambert+AO')
        texToDisplay = 0;
   });
}

var initCamera = function () {
  // Setup camera
  persp = mat4.create();
  mat4.perspective(persp, todeg(60), canvas.width / canvas.height, 0.1, 2000);

  camera = CIS565WEBGLCORE.createCamera(CAMERA_TRACKING_TYPE);
  camera.goHome([0, 0, 3]);
  interactor = CIS565WEBGLCORE.CameraInteractor(camera, canvas);

  // Add key-input controls
  window.onkeydown = function (e) {
    interactor.onKeyDown(e);
    switch(e.keyCode) {
      case 48:   //0 = SSAO + diffuse
        isDiagnostic = false;
        texToDisplay = 0;
		break;
      case 49:    //1   =  position shading
        isDiagnostic = true;
        texToDisplay = 1;
        break;
      case 50:     //2  = normal shading
        isDiagnostic = true;
        texToDisplay = 2;
        break;
      case 51:    //3 = color shading
        isDiagnostic = true;
        texToDisplay = 3;
        break;
      case 52:  //4 = depth shading
        isDiagnostic = true;
        texToDisplay = 4;
        break;
      case 53:  //5 = diffuse shading
        isDiagnostic = false;
        texToDisplay = 5;
        break;
      case 54:  //6  = blinn shading
        isDiagnostic = false;
        texToDisplay = 6;
        break;
      case 55:  //7 = bloom shading
        isDiagnostic = false;
        texToDisplay = 7;
        break;
      case 56:  //8 = toon shading  + silhouette
        isDiagnostic = false;
        texToDisplay = 8;
        break;
      case 57:  //9 = SSAO
        isDiagnostic = false;
        texToDisplay = 9;
        break;
    }
  }
};

var initObjs = function () {
  // Create an OBJ loader
  objloader = CIS565WEBGLCORE.createOBJLoader();

  // Load the OBJ from file
  if(modelToLoad == 0){
	console.log("load suzanne");
	objloader.loadFromFile(gl, "assets/models/suzanne.obj", null);
	camera.goHome([0, 0, 3]);
	zFar = 2000.0;
	zNear = 20.0;
  }else if (modelToLoad == 1){
	console.log("load village");
	objloader.loadFromFile(gl, "assets/models/myScene3.obj",null);
	camera.goHome([0, 1, 6]);
	zFar = 2000.0;
	zNear = 20.0;
  }else if(modelToLoad == 2){
	objloader.loadFromFile(gl, "assets/models/teapot/hteapot.obj", null);
	camera.goHome([0, 8, 20]);
	zFar = 20000.0;
	zNear = 20.0;
  }else if(modelToLoad == 3){
	objloader.loadFromFile(gl, "assets/models/myScene2.obj",null);
	camera.goHome([0, 0, 4]);
	zFar = 2000.0;
	zNear = 20.0;
  }else if(modelToLoad == 4){
	objloader.loadFromFile(gl, "assets/models/crytek-sponza/sponza.obj",null);
	camera.goHome([-300, 320, 0]);
	zFar = 25000.0;
	zNear = 2.0;
  }
  
 
  //objloader.loadFromFile(gl, "assets/models/myScene.obj",null);
//  objloader.loadFromFile(gl, "assets/models/crytek-sponza/sponza.obj", "assets/models/crytek-sponza/sponza.mtl")
//objloader.loadFromFile(gl, "assets/models/sphere/sphere.obj", "assets/models/sphere/sphere.mtl");


  // Add callback to upload the vertices once loaded
  objloader.addCallback(function () {
    model = new Model(gl, objloader);
	var sum = 0;
	for(var i=0; i<model.numGroups(); i++){
		sum+= model.iboLength(i);
	}
	console.log ("model created with number of indices: " + sum);
  });
	objloader.executeCallBackFunc();
	//testTex = gl.createTexture();
	//initializeTexture(testTex, "assets/models/sphere/sphere.jpg");

  // Register callback item
  CIS565WEBGLCORE.registerAsyncObj(gl, objloader);

  // Initialize full-screen quad
  quad.vbo = gl.createBuffer();
  quad.ibo = gl.createBuffer();
  quad.tbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenQuad.vertices), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, quad.tbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenQuad.texcoords), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(screenQuad.indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

var initShadersForward = function(){
// Create shader program for forward render
  forwardProg = CIS565WEBGLCORE.createShaderProgram();
  forwardProg.loadShader(gl, "assets/shader/forward.vert", "assets/shader/forward.frag");
  
  forwardProg.addCallback( function() { 
	gl.useProgram(forwardProg.ref());
	
	forwardProg.aVertexPosLoc = gl.getAttribLocation( forwardProg.ref(), "a_position" );
    forwardProg.aVertexNormalLoc = gl.getAttribLocation( forwardProg.ref(), "a_normal" );
	//passProg.aVertexTexcoordLoc = gl.getAttribLocation( forwardProg.ref(), "a_texcoord" );

	forwardProg.uPerspMatLoc = gl.getUniformLocation( forwardProg.ref(), "u_persp");
    forwardProg.uModelViewMatLoc = gl.getUniformLocation( forwardProg.ref(), "u_modelView" );
   });
   
  CIS565WEBGLCORE.registerAsyncObj(gl, forwardProg); 
};

var initShaders = function () {
  if (fbo.isMultipleTargets()) {
    // Create a shader program for rendering the object we are loading
    passProg = CIS565WEBGLCORE.createShaderProgram();

    // Load the shader source asynchronously
    passProg.loadShader(gl, "assets/shader/deferred/pass.vert", "assets/shader/deferred/pass.frag");

    // Register the necessary callback functions
    passProg.addCallback( function() {
      gl.useProgram(passProg.ref());

      // Add uniform locations
      passProg.aVertexPosLoc = gl.getAttribLocation( passProg.ref(), "a_pos" );
      passProg.aVertexNormalLoc = gl.getAttribLocation( passProg.ref(), "a_normal" );
      passProg.aVertexTexcoordLoc = gl.getAttribLocation( passProg.ref(), "a_texcoord" );

      passProg.uPerspLoc = gl.getUniformLocation( passProg.ref(), "u_projection" );
      passProg.uModelViewLoc = gl.getUniformLocation( passProg.ref(), "u_modelview" );
      passProg.uMVPLoc = gl.getUniformLocation( passProg.ref(), "u_mvp" );
      passProg.uNormalMatLoc = gl.getUniformLocation( passProg.ref(), "u_normalMat");
      passProg.uSamplerLoc = gl.getUniformLocation( passProg.ref(), "u_sampler");
      passProg.uDiffuseColorLoc = gl.getUniformLocation( passProg.ref(), "u_diffuseColor");
    });

    CIS565WEBGLCORE.registerAsyncObj(gl, passProg);
  } else {
    posProg = CIS565WEBGLCORE.createShaderProgram();
    posProg.loadShader(gl, "assets/shader/deferred/posPass.vert", "assets/shader/deferred/posPass.frag");
    posProg.addCallback(function() {
      posProg.aVertexPosLoc = gl.getAttribLocation(posProg.ref(), "a_pos");

      posProg.uModelViewLoc = gl.getUniformLocation(posProg.ref(), "u_modelview");
      posProg.uMVPLoc = gl.getUniformLocation(posProg.ref(), "u_mvp");
    });
    CIS565WEBGLCORE.registerAsyncObj(gl, posProg);

    normProg = CIS565WEBGLCORE.createShaderProgram();
    normProg.loadShader(gl, "assets/shader/deferred/normPass.vert", "assets/shader/deferred/normPass.frag");
    normProg.addCallback(function() {
      normProg.aVertexPosLoc = gl.getAttribLocation(normProg.ref(), "a_pos");
      normProg.aVertexNormalLoc = gl.getAttribLocation(normProg.ref(), "a_normal");

      normProg.uMVPLoc = gl.getUniformLocation(normProg.ref(), "u_mvp");
      normProg.uNormalMatLoc = gl.getUniformLocation(normProg.ref(), "u_normalMat");
    });
    CIS565WEBGLCORE.registerAsyncObj(gl, normProg);

    colorProg = CIS565WEBGLCORE.createShaderProgram();
    colorProg.loadShader(gl, "assets/shader/deferred/colorPass.vert", "assets/shader/deferred/colorPass.frag");
    colorProg.addCallback(function(){
      colorProg.aVertexPosLoc = gl.getAttribLocation(colorProg.ref(), "a_pos");

      colorProg.uMVPLoc = gl.getUniformLocation(colorProg.ref(), "u_mvp");
	  colorProg.uDiffuseColorLoc = gl.getUniformLocation( colorProg.ref(), "u_diffuseColor");
    });
    CIS565WEBGLCORE.registerAsyncObj(gl, colorProg);
  }

  // Create shader program for diagnostic
  diagProg = CIS565WEBGLCORE.createShaderProgram();
  diagProg.loadShader(gl, "assets/shader/deferred/quad.vert", "assets/shader/deferred/diagnostic.frag");
  diagProg.addCallback( function() { 
    diagProg.aVertexPosLoc = gl.getAttribLocation( diagProg.ref(), "a_pos" );
    diagProg.aVertexTexcoordLoc = gl.getAttribLocation( diagProg.ref(), "a_texcoord" );

    diagProg.uPosSamplerLoc = gl.getUniformLocation( diagProg.ref(), "u_positionTex");
    diagProg.uNormalSamplerLoc = gl.getUniformLocation( diagProg.ref(), "u_normalTex");
    diagProg.uColorSamplerLoc = gl.getUniformLocation( diagProg.ref(), "u_colorTex");
    diagProg.uDepthSamplerLoc = gl.getUniformLocation( diagProg.ref(), "u_depthTex");

    diagProg.uZNearLoc = gl.getUniformLocation( diagProg.ref(), "u_zNear" );
    diagProg.uZFarLoc = gl.getUniformLocation( diagProg.ref(), "u_zFar" );
    diagProg.uDisplayTypeLoc = gl.getUniformLocation( diagProg.ref(), "u_displayType" );
  });
  CIS565WEBGLCORE.registerAsyncObj(gl, diagProg);

  // Create shader program for shade
  shadeProg = CIS565WEBGLCORE.createShaderProgram();
  shadeProg.loadShader(gl, "assets/shader/deferred/quad.vert", "assets/shader/deferred/diffuse.frag");
  shadeProg.addCallback( function() { 
    shadeProg.aVertexPosLoc = gl.getAttribLocation( shadeProg.ref(), "a_pos" );
    shadeProg.aVertexTexcoordLoc = gl.getAttribLocation( shadeProg.ref(), "a_texcoord" );

    shadeProg.uPosSamplerLoc = gl.getUniformLocation( shadeProg.ref(), "u_positionTex");
    shadeProg.uNormalSamplerLoc = gl.getUniformLocation( shadeProg.ref(), "u_normalTex");
    shadeProg.uColorSamplerLoc = gl.getUniformLocation( shadeProg.ref(), "u_colorTex");
    shadeProg.uDepthSamplerLoc = gl.getUniformLocation( shadeProg.ref(), "u_depthTex");
    shadeProg.uNoiseSamplerLoc = gl.getUniformLocation( shadeProg.ref(),"u_noiseTex");
    shadeProg.uExtraSamplerLoc = gl.getUniformLocation( shadeProg.ref(),"u_extraTex");

    shadeProg.uLightDirLoc = gl.getUniformLocation( shadeProg.ref(),"u_lightDir");
    shadeProg.uLightColorLoc = gl.getUniformLocation( shadeProg.ref(),"u_lightColor");
    shadeProg.uEyePosLoc = gl.getUniformLocation( shadeProg.ref(),"u_eyePos");
    shadeProg.uViewDirLoc = gl.getUniformLocation( shadeProg.ref(), "u_viewDirection");

    shadeProg.uZNearLoc = gl.getUniformLocation( shadeProg.ref(), "u_zNear" );
    shadeProg.uZFarLoc = gl.getUniformLocation( shadeProg.ref(), "u_zFar" );
    shadeProg.uDisplayTypeLoc = gl.getUniformLocation( shadeProg.ref(), "u_displayType" );

    shadeProg.uKernelLoc3 = gl.getUniformLocation( shadeProg.ref(), "u_kernel3");
    shadeProg.uPerspMatLoc = gl.getUniformLocation(shadeProg.ref(), "u_perspMat");
    shadeProg.uOffsetLoc = gl.getUniformLocation(shadeProg.ref(), "u_offset");   //texture coord offset
    shadeProg.uOffsetLoc2 = gl.getUniformLocation( shadeProg.ref(), "u_offset2");

  //  shadeProg.uKernelLoc = gl.getUniformLocation( shadeProg.ref(), "u_kernel");  // 25 * float 
   // shadeProg.uOffsetLoc = gl.getUniformLocation( shadeProg.ref(), "u_offset");   //texture coord offset
  });
  CIS565WEBGLCORE.registerAsyncObj(gl, shadeProg); 


  // Create shader program for post-process
  postProg = CIS565WEBGLCORE.createShaderProgram();
  postProg.loadShader(gl, "assets/shader/deferred/quad.vert", "assets/shader/deferred/post.frag");
  postProg.addCallback( function() { 
    postProg.aVertexPosLoc = gl.getAttribLocation( postProg.ref(), "a_pos" );
    postProg.aVertexTexcoordLoc = gl.getAttribLocation( postProg.ref(), "a_texcoord" );

    postProg.uShadeSamplerLoc = gl.getUniformLocation( postProg.ref(), "u_shadeTex");
    postProg.uDisplayTypeLoc = gl.getUniformLocation( postProg.ref(), "u_displayType" );
    postProg.uBloomSamplerLoc = gl.getUniformLocation( postProg.ref(), "u_bloomTex");
   
   /* postProg.uBloomSamplerLoc0 = gl.getUniformLocation( postProg.ref(), "u_bloomTex0");
    postProg.uBloomSamplerLoc1 = gl.getUniformLocation( postProg.ref(), "u_bloomTex1");
    postProg.uBloomSamplerLoc2 = gl.getUniformLocation( postProg.ref(), "u_bloomTex2");
    postProg.uBloomSamplerLoc3 = gl.getUniformLocation( postProg.ref(), "u_bloomTex3");*/

    postProg.uKernelLoc = gl.getUniformLocation( postProg.ref(), "u_kernel");  // 25 * float 
  //  postProg.uKernel2Loc = gl.getUniformLocation( postProg.ref(), "u_kernel2");  // 21*21 * float 

    postProg.uOffsetLoc = gl.getUniformLocation( postProg.ref(), "u_offset");   //texture coord offset
    postProg.uOffsetLoc2 = gl.getUniformLocation( postProg.ref(), "u_offset2");
    
      });
  CIS565WEBGLCORE.registerAsyncObj(gl, postProg); 
  
};

var initFramebuffer = function () {
  fbo = CIS565WEBGLCORE.createFBO();
  if (!fbo.initialize(gl, canvas.width, canvas.height)) {
    console.log("FBO Initialization failed");
    return;
  }


};
