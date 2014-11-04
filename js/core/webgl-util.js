// Written by Cheng-Tso Lin for CIS 700.  Modified by Harmony Li for CIS 565.
// CIS 565 : GPU Programming, Fall 2014.
// Project 6 : WebGL Deferred Shader
// University of Pennsylvania (c) 2014. 

//CIS565WEBGLCORE is a core function interface
var CIS565WEBGLCORE = CIS565WEBGLCORE || {};

CIS565WEBGLCORE.getWebGLContext = function( canvas, message ){

    var ctx = null;
    var names = [ "webgl", "experimental-webgl", "webkit-3d" ];
    if( !window.WebGLRenderingContext ){
        message.innerText = "The browser does not support WebGL.  Visit http://get.webgl.org.";
        return undefined;
    }
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            ctx = canvas.getContext(names[ii]);
        } 
        catch(e) {}
        if (ctx) {
            break;
        }
    }

    if( !ctx ){
    	message.innerText = "browser supports WebGL but initialization failed.";
    }
    return ctx;
};


CIS565WEBGLCORE.registerAsyncObj = function( gl, asyncObj ){
    if( !gl.asyncObjArray ){
        gl.asyncObjArray = [];
    }
    gl.asyncObjArray[gl.asyncObjArray.length] = asyncObj;
};

//Make sure all objects with asynchronously-requested resources are ready before starting the rendering loop
CIS565WEBGLCORE.run = function(gl){
    var i;
    var n;

    n = gl.asyncObjArray.length;

    //check if resources are ready, one by one
    for( i = 0; i < gl.asyncObjArray.length; ++i ){
        if( gl.asyncObjArray[i].isReady() ){
            //Run object's registered callback functions
            gl.asyncObjArray[i].executeCallBackFunc();
            n -= 1;
        }
    }


    if( n === 0 ){
       CIS565WEBGLCORE.renderLoop(); 
    }
    else{
        window.setTimeout( CIS565WEBGLCORE.run, 500, gl );
    }
};
