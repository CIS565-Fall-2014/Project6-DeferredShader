// Written by Cheng-Tso Lin for CIS 700.  Modified by Harmony Li for CIS 565.
// CIS 565 : GPU Programming, Fall 2014.
// Project 6 : WebGL Deferred Shader
// University of Pennsylvania (c) 2014. //CIS700WEBGLCORE is a core function interface

var CIS565WEBGLCORE = CIS565WEBGLCORE || {};

// createShaderProgram returns an object representing a shader program
// The shader sources are asynchronouosly retrieved
// from the server when loadShader is called
CIS565WEBGLCORE.createShaderProgram = function(){
    "use strict"

    var VERTEX_SHADER_SRC = null;    //string content of vertex shader
    var FRAGMENT_SHADER_SRC = null;  //string content of fragment shader
    var program = null;              //shader program
    var callbackFunArray = [];

	function loadShaderFile( gl, fileName, shader ){
		var request = new XMLHttpRequest();

	  // Register a callback function  
		request.onreadystatechange = function(){
            
		  if( request.readyState == 4 && request.status != 404 ){
				onLoadShader( gl, request.responseText, shader );
			}
		}
	  
    request.open( 'GET', fileName, true );
	  request.send();
	}

	function onLoadShader( gl, fileString, type )
	{
		if( type == gl.VERTEX_SHADER ){
			VERTEX_SHADER_SRC = fileString;
            //console.log( fileString );
		}
		else if( type == gl.FRAGMENT_SHADER ){
			FRAGMENT_SHADER_SRC = fileString;
            //console.log( fileString );
		}

		if( VERTEX_SHADER_SRC && FRAGMENT_SHADER_SRC ){
      // Codes of both shaders are retrieved
      // Proceed to create the shader program
      initShaderProgram( gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC );
		}
	}

	function initShaderProgram( gl, v_shader_src, f_shader_src ){
		program = createProgram( gl, v_shader_src, f_shader_src );
		if( !program ){
			console.log( 'Failed to create shader program' );
			return false;
		}

		return true;
	}

	function createProgram( gl, v_shader_src, f_shader_src ){
        var vertexShader = createShaderObj( gl, gl.VERTEX_SHADER, v_shader_src );
        var fragmentShader = createShaderObj( gl, gl.FRAGMENT_SHADER, f_shader_src );
        var status, error;

        if( !vertexShader || !fragmentShader ){
        	return null;
        }
       
        program = gl.createProgram();
        if( !program ){
        	return null;
        }

        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );

        gl.linkProgram( program );

        //check shader linking status
        status = gl.getProgramParameter( program, gl.LINK_STATUS );
        if( !status ){
        	error = gl.getProgramInfoLog( program );
        	console.log( 'Link program failed: ' + error );
        	gl.deleteProgram( program );
        	program = null;
        	gl.deleteShader( vertexShader );
        	gl.deleteShader( fragmentShader );
        	vertexShader = null;
        	fragmentShader = null;
        	return null;
        }
        return program;
	}

	function createShaderObj( gl, shader_type, shader_src ){
		var status, error;
        var shader = gl.createShader( shader_type );
        if( shader == null ){
        	console.log( 'Create shader failed.' );
        	return null;
        }

        gl.shaderSource( shader, shader_src );

        gl.compileShader( shader );

        // check shader compilation status
        status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
        if( !status ){
        	error = gl.getShaderInfoLog( shader );
        	console.log( 'Failed to compile shader: ' + error );
        	gl.deleteShader( shader );
        	return null;
        }

        return shader;
	}
     
    // Return an object exposing necessary functions 
    return {
        ref: function(){  //expose shader program object for use
            return program;
        },
    	  loadShader: function( gl, vsFileName, fsFileName ){
    	    loadShaderFile( gl, vsFileName, gl.VERTEX_SHADER );
    	    loadShaderFile( gl, fsFileName, gl.FRAGMENT_SHADER );
        },

        ///// The following 3 functions should be implemented for all objects
        ///// whose resources are retrieved asynchronously
        isReady: function(){
            return program;
        },
        addCallback: function( functor ){
            callbackFunArray[callbackFunArray.length] = functor;
        },
        executeCallBackFunc: function(){
            var i;
            for( i = 0; i < callbackFunArray.length; ++i ){
                callbackFunArray[i]();
            }
        }
    };
};
