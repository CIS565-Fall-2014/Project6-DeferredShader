var Lighting = function (type) {};

var LIGHTING_ARRAY = 1;
var LIGHTING_RANDOM = 2;
var MAX_LOCATION = 500.0;
var lightPosArray = {};
var lightColArray = {};
var randomTimer = 0;
var randomMove = 0.1;
var lightPosTex;

Lighting.prototype = {
  constructor: Lighting,
	function getRandomArbitrary(min, max) {
	  return Math.random() * (max - min) + min;
	}
  function initLights(){

  	for(int i=0; i<LIGHTING_ARRAY; i++){
  		lightPosArray[3*i + 0] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);
  		lightPosArray[3*i + 1] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);
  		lightPosArray[3*i + 2] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);

  		lightColArray[3*i + 0] = Math.random();
  		lightColArray[3*i + 1] = Math.random();
  		lightColArray[3*i + 2] = Math.random();
  	}
  }

  function initLightsFBO(){
  /*	lightPosTex = gl.createTexture();
     	gl.bindTexture( gl.TEXTURE_2D, lightPosTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);*/
  }
};
