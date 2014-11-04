// Written by Harmony Li. Based on Cheng-Tso Lin's CIS 700 starter engine.
// cIS 565 : GPU Programming, Fall 2014.
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

// Shader programs
var modelProg;      // Model shader program object

var Model = function (gl, objLoader) {
  var numGroups = objLoader.numGroups();
  var vbo = [];
  var ibo = [];
  var nbo = [];
  var iboLength = [];

  for (var i = 0; i < numGroups; i++) {
    // Initialize buffer objects
    vbo[i] = gl.createBuffer();
    ibo[i] = gl.createBuffer();
    nbo[i] = gl.createBuffer();

    // Add vbo, ibo, nbo and tbo
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objLoader.vertices(i)), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objLoader.normals(i)), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[i]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objLoader.indices(i)), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    iboLength.push(objLoader.indices(i).length);
  }

  return {
    vbo: function(i) {
      return vbo[i];
    },
    ibo: function(i) {
      return ibo[i];
    },
    nbo: function(i) {
      return nbo[i];
    }, 
    numGroups: function() {
      return numGroups;
    },
    iboLength: function(i) {
      return iboLength[i];
    }
  }
}

var main = function (canvasId, messageId) {
  var canvas;

  // Initialize WebGL
  initGL(canvasId, messageId);

  // Set up camera
  initCamera(canvas);

  // Set up models
  initObjs();

  // Set up shaders
  initShaders();

  // Register our render callbacks
  CIS565WEBGLCORE.render = render;
  CIS565WEBGLCORE.renderLoop = renderLoop;

  // Start the rendering loop
  CIS565WEBGLCORE.run(gl);};

var renderLoop = function () {
  window.requestAnimationFrame(renderLoop);
  render();
};

var render = function () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(modelProg.ref());

  gl.uniformMatrix4fv(modelProg.uPerspLoc, false, persp);
  gl.uniformMatrix4fv(modelProg.uModelViewLoc, false, camera.getViewTransform());

  // Bind attributes
  for(var i = 0; i < model.numGroups(); i++) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vbo(i));
    gl.vertexAttribPointer(modelProg.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(modelProg.aVertexPosLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.nbo(i));
    gl.vertexAttribPointer(modelProg.aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(modelProg.aNormalLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.ibo(i));
    gl.drawElements(gl.TRIANGLES, model.iboLength(i), gl.UNSIGNED_SHORT, 0);
  }

  /*gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
  gl.vertexAttribPointer(modelProg.aVertexPosLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(modelProg.aVertexPosLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.tbo);
  gl.vertexAttribPointer(modelProg.aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(modelProg.aTexCoordLoc);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.ibo);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);*/

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.useProgram(null);
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
  mat4.perspective(persp, todeg(60), canvas.width / canvas.height, 20, 2000);

  camera = CIS565WEBGLCORE.createCamera(CAMERA_TRACKING_TYPE);
  camera.goHome([-1, 400, 0]);
  interactor = CIS565WEBGLCORE.CameraInteractor(camera, canvas);
};

var initObjs = function () {
  // Create an OBJ loader
  objloader = CIS565WEBGLCORE.createOBJLoader();

  // Load the OBJ from file
  objloader.loadFromFile(gl, "assets/models/crytek-sponza/sponza.obj", null);

  // Add callback to upload the vertices once loaded
  objloader.addCallback(function () {
    model = new Model(gl, objloader);
  });

  // Register callback item
  CIS565WEBGLCORE.registerAsyncObj(gl, objloader);

  // Create full-screen quad
  /*quad.vbo = gl.createBuffer();
  quad.tbo = gl.createBuffer();
  quad.ibo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenQuad.vertices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, quad.tbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenQuad.texcoords), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(screenQuad.indices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);*/
};

var initShaders = function () {
  // Create a shader program for rendering the object we are loading
  modelProg = CIS565WEBGLCORE.createShaderProgram();
 
  // Load the shader source asynchronously
  modelProg.loadShader(gl, "assets/shader/forward.vert", "assets/shader/forward.frag");

  // Register the necessary callback functions
  modelProg.addCallback( function() {
    gl.useProgram(modelProg.ref());

    // Add uniform locations
    modelProg.aVertexPosLoc = gl.getAttribLocation(modelProg.ref(), "v_position");
    modelProg.aNormalLoc = gl.getAttribLocation(modelProg.ref(), "v_normal");
    modelProg.uPerspLoc = gl.getUniformLocation(modelProg.ref(), "u_persp");
    modelProg.uModelViewLoc = gl.getUniformLocation(modelProg.ref(), "u_modelView");
  });

  CIS565WEBGLCORE.registerAsyncObj(gl, modelProg);
};
