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
var quad2 = {}; //second quad?

// Framebuffer
var fbo = null;

// Shader programs
var passProg;     // Shader program for G-Buffer
var shadeProg;    // Shader program for P-Buffer
var diagProg;     // Shader program from diagnostic 
var postProg;     // Shader for post-process effects

// Multi-Pass programs
var posProg;
var normProg;
var colorProg;

var isDiagnostic = true;
var zNear = 20;
var zFar = 2000;
var texToDisplay = 1;

///////////////////////////////////////gaussian kernel//////////////////////////////////
var gaussian5x5 = [
    1.0, 4.0,  7.0,  4.0,  1.0,
    4.0, 16.0, 26.0, 16.0, 4.0,
    7.0, 26.0, 41.0, 26.0, 7.0,
    4.0, 16.0, 26.0, 16.0, 4.0,
    1.0, 4.0,  7.0,  4.0,  1.0
  ];
var randArray = [];


var main = function (canvasId, messageId) {
  var canvas;

  // Initialize WebGL
  initGL(canvasId, messageId);

  // Set up camera
  initCamera(canvas);

  // Set up FBOs
  initFramebuffer();

  // Set up models
  initObjs();

  // Set up shaders
  initShaders();

  // Register our render callbacks
  CIS565WEBGLCORE.render = render;
  CIS565WEBGLCORE.renderLoop = renderLoop;

  // Start the rendering loop
  CIS565WEBGLCORE.run(gl);
};

var renderLoop = function () {
  window.requestAnimationFrame(renderLoop);
  render();
};

var render = function () {
  if (fbo.isMultipleTargets()) {
    renderPass();
  } else {
    renderMulti();
  }

  if (!isDiagnostic) {
    renderAmbient();// Calculate Ambient Occlusion Before next rendering step!
    renderShade();
    renderPost();
  } else {
    renderDiagnostic();
  }

  gl.useProgram(null);
};

var drawModel = function (program, mask) {
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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ibo(i));
    gl.drawElements(gl.TRIANGLES, model.iboLength(i), gl.UNSIGNED_SHORT, 0);
  }

  if (mask & 0x1) gl.disableVertexAttribArray(program.aVertexPosLoc);
  if (mask & 0x2) gl.disableVertexAttribArray(program.aVertexNormalLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

var drawQuad = function (program) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
  gl.vertexAttribPointer(program.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.tbo);//this?
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

  //update the model-view matrix
  var mvpMat = mat4.create();
  mat4.multiply( mvpMat, persp, camera.getViewTransform() );

  //update the normal matrix
  var nmlMat = mat4.create();
  mat4.invert( nmlMat, camera.getViewTransform() );
  mat4.transpose( nmlMat, nmlMat);

  gl.uniformMatrix4fv( passProg.uModelViewLoc, false, camera.getViewTransform());        
  gl.uniformMatrix4fv( passProg.uMVPLoc, false, mvpMat );        
  gl.uniformMatrix4fv( passProg.uNormalMatLoc, false, nmlMat );       

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
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(normProg.ref());

  //update the normal matrix////////////////////////////////////////////////////////////////////////
  var nmlMat = mat4.create();
  mat4.invert( nmlMat, camera.getViewTransform() );
  mat4.transpose( nmlMat, nmlMat);
  
  gl.uniformMatrix4fv(normProg.uMVPLoc, false, mvpMat);
  gl.uniformMatrix4fv(normProg.uNormalMatLoc, false, nmlMat);

  drawModel(normProg, 3);

  gl.useProgram(null);
  fbo.unbind(gl);
////////////////////////////////////////////////////////////////////
  fbo.bind(gl, FBO_GBUFFER_COLOR);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(colorProg.ref());

  gl.uniformMatrix4fv(colorProg.uMVPLoc, false, mvpMat);

  drawModel(colorProg, 1);

  gl.useProgram(null);
  fbo.unbind(gl);
  //////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////
  gl.activeTexture( gl.TEXTURE5 );  //occlusion
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(5) );
  gl.uniform1i( shadeProg.uExtraLoc, 5 );
////////////////////////////////////////////////////////////

  // Bind necessary uniforms 
  gl.uniform1f( shadeProg.uZNearLoc, zNear );
  gl.uniform1f( shadeProg.uZFarLoc, zFar );
  
  gl.uniform2f(shadeProg.uTexSizeLoc, canvas.width, canvas.height)////////add texture size
  var randomNum = Math.random();
  randArray = [];
  for (var i = 0; i < 64; i ++){
    randArray.push(randomNum);
    randomNum = Math.random();
  }
  gl.uniform1fv(shadeProg.uRandNoiseLoc , randArray);//randomNoise
  drawQuad(shadeProg);

  // Unbind FBO
  fbo.unbind(gl);
};
////////////////////////////////////////////////////////////////////////////////////////
// NEW PIPELINE STAGE!!!
///////////////////////////////////////////////////////////////////////////////////////
var renderAmbient = function () {
  gl.useProgram(ambientProg.ref());
  gl.disable(gl.DEPTH_TEST);

  // Bind FBO
  //fbo.bind(gl, FBO_PBUFFER);
  fbo.bind(gl, FBO_EXTRA);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind necessary textures
  gl.activeTexture( gl.TEXTURE0 );  //position
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(0) );
  gl.uniform1i( ambientProg.uPosSamplerLoc, 0 );

  gl.activeTexture( gl.TEXTURE1 );  //normal
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(1) );
  gl.uniform1i( ambientProg.uNormalSamplerLoc, 1 );

  gl.activeTexture( gl.TEXTURE2 );  //color
  gl.bindTexture( gl.TEXTURE_2D, fbo.texture(2) );
  gl.uniform1i( ambientProg.uColorSamplerLoc, 2 );

  gl.activeTexture( gl.TEXTURE3 );  //depth
  gl.bindTexture( gl.TEXTURE_2D, fbo.depthTexture() );
  gl.uniform1i( ambientProg.uDepthSamplerLoc, 3 );

/////////////////////////////////////////////////////////////
//  gl.activeTexture( gl.TEXTURE5 );  //occlusion
//  gl.bindTexture( gl.TEXTURE_2D, fbo.occlusionTexture() );
//  gl.uniform1i( ambientProg.uExtraLoc, 4 );///////////////////////////////////
////////////////////////////////////////////////////////////

  // Bind necessary uniforms 
  gl.uniform1f( ambientProg.uZNearLoc, zNear );
  gl.uniform1f( ambientProg.uZFarLoc, zFar );
  
  gl.uniform2f(ambientProg.uTexSizeLoc, canvas.width, canvas.height)////////add texture size
  var randomNum = Math.random();
  randArray = [];
  for (var i = 0; i < 64; i ++){
    randArray.push(randomNum);
    randomNum = Math.random();
  }
  gl.uniform1fv(ambientProg.uRandNoiseLoc , randArray);//randomNoise
  drawQuad(ambientProg);
  gl.useProgram(null);

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
  //////////////////////////////////////////////////////////////////////NEW POST PROCESSING///////////////////////
  gl.uniform1fv(postProg.uGaussKern , gaussian5x5 );
  gl.uniform2f(postProg.uTexSizeLoc, canvas.width, canvas.height)////////add texture size
  drawQuad(postProg);
};

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
};

var initCamera = function () {
  // Setup camera
  persp = mat4.create();
  mat4.perspective(persp, todeg(60), canvas.width / canvas.height, 0.1, 2000);

  camera = CIS565WEBGLCORE.createCamera(CAMERA_TRACKING_TYPE);
  camera.goHome([0, 0, 4]);
  interactor = CIS565WEBGLCORE.CameraInteractor(camera, canvas);

  // Add key-input controls
  window.onkeydown = function (e) {
    interactor.onKeyDown(e);
    switch(e.keyCode) {
      case 48:
        isDiagnostic = false;
        break;
      case 49:
        isDiagnostic = true;
        texToDisplay = 1;
        break;
      case 50: 
        isDiagnostic = true;
        texToDisplay = 2;
        break;
      case 51:
        isDiagnostic = true;
        texToDisplay = 3;
        break;
      case 52:
        isDiagnostic = true;
        texToDisplay = 4;
        break;
    }
  }
};

var initObjs = function () {
  // Create an OBJ loader
  objloader = CIS565WEBGLCORE.createOBJLoader();

  // Load the OBJ from file
  objloader.loadFromFile(gl, "assets/models/suzanne.obj", null);
  //objloader.loadFromFile(gl, "assets/models/Trex.obj", null);

  // Add callback to upload the vertices once loaded
  objloader.addCallback(function () {
    model = new Model(gl, objloader);
  });

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    colorProg = CIS565WEBGLCORE.createShaderProgram();
    colorProg.loadShader(gl, "assets/shader/deferred/colorPass.vert", "assets/shader/deferred/colorPass.frag");
    colorProg.addCallback(function(){
      colorProg.aVertexPosLoc = gl.getAttribLocation(colorProg.ref(), "a_pos");

      colorProg.uMVPLoc = gl.getUniformLocation(colorProg.ref(), "u_mvp");
    });

    CIS565WEBGLCORE.registerAsyncObj(gl, colorProg);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

    shadeProg.uPosSamplerLoc    = gl.getUniformLocation( shadeProg.ref(), "u_positionTex");
    shadeProg.uNormalSamplerLoc = gl.getUniformLocation( shadeProg.ref(), "u_normalTex");
    shadeProg.uColorSamplerLoc  = gl.getUniformLocation( shadeProg.ref(), "u_colorTex");
    shadeProg.uDepthSamplerLoc  = gl.getUniformLocation( shadeProg.ref(), "u_depthTex");
    shadeProg.uExtraLoc         = gl.getUniformLocation( shadeProg.ref(), "u_extraTex");

    shadeProg.uZNearLoc = gl.getUniformLocation( shadeProg.ref(), "u_zNear" );
    shadeProg.uZFarLoc = gl.getUniformLocation( shadeProg.ref(), "u_zFar" );
    shadeProg.uDisplayTypeLoc = gl.getUniformLocation( shadeProg.ref(), "u_displayType" );
    ////////////////////////////////////////////////////////////////////////////////////////new stuff
    shadeProg.uTexSizeLoc = gl.getUniformLocation( shadeProg.ref(), "u_textureSize");
    shadeProg.uRandNoiseLoc = gl.getUniformLocation( postProg.ref(), "u_randomNoise");//randomNoise
  });
  CIS565WEBGLCORE.registerAsyncObj(gl, shadeProg); 
  
  // Create shader program for AMBIENT OCCLUSION
  ambientProg = CIS565WEBGLCORE.createShaderProgram();
  ambientProg.loadShader(gl, "assets/shader/deferred/quad.vert", "assets/shader/deferred/ambient.frag");
  ambientProg.addCallback( function() { 
    ambientProg.aVertexPosLoc = gl.getAttribLocation( ambientProg.ref(), "a_pos" );
    ambientProg.aVertexTexcoordLoc = gl.getAttribLocation( ambientProg.ref(), "a_texcoord" );

    ambientProg.uPosSamplerLoc    = gl.getUniformLocation( ambientProg.ref(), "u_positionTex");
    ambientProg.uNormalSamplerLoc = gl.getUniformLocation( ambientProg.ref(), "u_normalTex");
    ambientProg.uColorSamplerLoc  = gl.getUniformLocation( ambientProg.ref(), "u_colorTex");
    ambientProg.uDepthSamplerLoc  = gl.getUniformLocation( ambientProg.ref(), "u_depthTex");
    //ambientProg.uExtraLoc         = gl.getUniformLocation( ambientProg.ref(), "u_extraTex");

    ambientProg.uZNearLoc = gl.getUniformLocation( ambientProg.ref(), "u_zNear" );
    ambientProg.uZFarLoc = gl.getUniformLocation( ambientProg.ref(), "u_zFar" );
    ambientProg.uDisplayTypeLoc = gl.getUniformLocation( ambientProg.ref(), "u_displayType" );
    ////////////////////////////////////////////////////////////////////////////////////////new stuff
    ambientProg.uTexSizeLoc = gl.getUniformLocation( ambientProg.ref(), "u_textureSize");
    ambientProg.uRandNoiseLoc = gl.getUniformLocation( postProg.ref(), "u_randomNoise");//randomNoise
  });
  CIS565WEBGLCORE.registerAsyncObj(gl, ambientProg); 

  // Create shader program for post-process
  postProg = CIS565WEBGLCORE.createShaderProgram();
  postProg.loadShader(gl, "assets/shader/deferred/quad.vert", "assets/shader/deferred/post.frag");
  postProg.addCallback( function() { 
    postProg.aVertexPosLoc = gl.getAttribLocation( postProg.ref(), "a_pos" );
    postProg.aVertexTexcoordLoc = gl.getAttribLocation( postProg.ref(), "a_texcoord" );

    postProg.uShadeSamplerLoc = gl.getUniformLocation( postProg.ref(), "u_shadeTex");
    ////////////////////////////////////////////////////////////////////////////////////////new stuff
    postProg.uGaussKern = gl.getUniformLocation( postProg.ref(), "u_gaussKernel");//gaussian
    postProg.uTexSizeLoc = gl.getUniformLocation( postProg.ref(), "u_textureSize");
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
