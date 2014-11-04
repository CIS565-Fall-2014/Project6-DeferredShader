
/**
* Camera Interactor
*
* This object listens for mouse and keyboard events on the canvas, then, it 
* interprets them and sends the intended instruction to the camera
*
* Based on the code sample from WebGL Beginner's Guide.
*/
var CIS565WEBGLCORE = CIS565WEBGLCORE || {};


CIS565WEBGLCORE.CameraInteractor = function(camera,canvas){
    
    var camera = camera;
    var canvas = canvas;
  
    
    var dragging = false;
    var x = 0;
    var y = 0;
    var lastX = 0;
    var lastY = 0;
    var button = 0;
    var ctrl = false;
    var key = 0;
    
    var MOTION_FACTOR = 10.0;
    var newObj={}; 

	var onMouseUp = function(ev){
	    dragging = false;
	};

	var  onMouseDown = function(ev){
	    dragging = true;
	    x = ev.clientX;
		y = ev.clientY;
		button = ev.button;
	};

	var onMouseMove = function(ev){
		lastX = x;
		lastY = y;
		x = ev.clientX;
	    y = ev.clientY;
		
		if (!dragging) return;
		ctrl = ev.ctrlKey;
		alt = ev.altKey;
		var dx = x - lastX;
		var dy = y - lastY;
		
		if (button == 0) { 
			if(ctrl){
				translate(dy);
			}
			else{ 
				rotate(dx,dy);
			}
		}
	};

	var onKeyDown = function(ev){
		
		key = ev.keyCode;
		ctrl = ev.ctrlKey;
		
		if (!ctrl){
			if (key == 38){
				camera.changeElevation(10);
			}
			else if (key == 40){
				camera.changeElevation(-10);
			}
			else if (key == 37){
				camera.changeAzimuth(-10);
			}
			else if (key == 39){
				camera.changeAzimuth(10);
			}
			else if( key == 87 ){
				camera.moveForward();
			}
			else if( key == 65){
				camera.moveLeft();
			}
			else if( key == 83 ){
				camera.moveBackward();
			}
			else if( key == 68 ){
				camera.moveRight();
			}
			else if( key == 82 ){
				camera.moveUp();
			}
			else if( key == 70 ){
				camera.moveDown();
			}
	
		}
	     
	};

	var onKeyUp = function(ev){
	    if (ev.keyCode == 17){
			ctrl = false;
		}
	};

	var update = function(){
	   

		canvas.onmousedown = function(ev) {
			onMouseDown(ev);
	    }

	    window.onmouseup = function(ev) {
			onMouseUp(ev);
	    }
		
		window.onmousemove = function(ev) {
			onMouseMove(ev);
	    }
		
		window.onkeydown = function(ev){
			onKeyDown(ev);
			
		}
		
		window.onkeyup = function(ev){
			onKeyUp(ev);
		}
	};

	var translate = function(value){
		
		var c = camera;
		var dv = 2 * MOTION_FACTOR * value / camera.view.canvas.height;
		
		c.dolly(Math.pow(1.1,dv));
	};

	var rotate = function(dx, dy){
		
		
		var delta_elevation = -20.0 / canvas.height;
		var delta_azimuth   = -20.0 / canvas.width;
					
		var nAzimuth = dx * delta_azimuth * MOTION_FACTOR;
		var nElevation = dy * delta_elevation * MOTION_FACTOR;
		
		camera.changeAzimuth(nAzimuth);
		camera.changeElevation(nElevation);
	};

    update();

    newObj.onMouseUp = onMouseUp;
    newObj.onMouseDown = onMouseDown;
    newObj.onMouseMove = onMouseMove;
    newObj.onKeyDown  = onKeyDown;
    newObj.onKeyUp = onKeyUp;
    newObj.update = update;
    newObj.translate = translate;
    newObj.rotate =rotate;
    return newObj;
};
