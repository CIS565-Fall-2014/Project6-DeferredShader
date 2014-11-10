
var LIGHTING_ARRAY = 1;
var LIGHTING_RANDOM = 2;
var DIRECTIONAL_LIGHT = 0;
var SPOT_LIGHT = 1;
var POINT_LIGHT = 2;
var MAX_LOCATION = 500.0;
var lightDir;
var lightPosArray = {};
var lightColArray = {};
var randomTimer = 0;
var randomMove = 0.1;
var lightPosTex;

var Lighting = function (type) {
  if(type == DIRECTIONAL_LIGHT){
      lightDir[0] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);
      lightDir[1] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);
      lightDir[2] = getRandomArbitrary(-MAX_LOCATION, MAX_LOCATION);

  }
  else if(type == SPOT_LIGHT){

  }

};



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

};
