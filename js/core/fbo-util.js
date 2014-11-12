//A wrapper for creating framebuffer objects

//CIS565WEBGLCORE is a core function interface
var CIS565WEBGLCORE = CIS565WEBGLCORE || {};

var FBO_GBUFFER = 0;
var FBO_PBUFFER = 10;
var FBO_GBUFFER_POSITION = 0;
var FBO_GBUFFER_NORMAL = 1;
var FBO_GBUFFER_COLOR = 2;
var FBO_GBUFFER_DEPTH = 3;
var FBO_GBUFFER_TEXCOORD = 4;

CIS565WEBGLCORE.createFBO = function(){
    "use strict"

     var textures = [];
     var depthTex = null;
     var fbo = [];

     var multipleTargets = true;

     function init( gl, width, height ){
     	gl.getExtension( "OES_texture_float" );
     	gl.getExtension( "OES_texture_float_linear" );
     	var extDrawBuffers = gl.getExtension( "WEBGL_draw_buffers");
     	var extDepthTex = gl.getExtension( "WEBGL_depth_texture" );

     	if( !extDepthTex ) {
        alert("WARNING : Depth texture extension unavailabe on your browser!");
        return false;
      }
        
      if ( !extDrawBuffers ){
     		alert("WARNING : Draw buffer extension unavailable on your browser! Defaulting to multiple render pases.");
     		multipleTargets = false;
     	}

     	//Create depth texture 
     	depthTex = gl.createTexture();
     	gl.bindTexture( gl.TEXTURE_2D, depthTex );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        // Create textures for FBO attachment 
        for( var i = 0; i < 5; ++i ){
        	textures[i] = gl.createTexture()
        	gl.bindTexture( gl.TEXTURE_2D,  textures[i] );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);        	
        }

        // Create GBuffer FBO
        if (multipleTargets) {
          fbo[FBO_GBUFFER] = gl.createFramebuffer();
          gl.bindFramebuffer( gl.FRAMEBUFFER, fbo[FBO_GBUFFER] );

          // Create render target;
          var drawbuffers = [];
          drawbuffers[0] = extDrawBuffers.COLOR_ATTACHMENT0_WEBGL;
          drawbuffers[1] = extDrawBuffers.COLOR_ATTACHMENT1_WEBGL;
          drawbuffers[2] = extDrawBuffers.COLOR_ATTACHMENT2_WEBGL;
          drawbuffers[3] = extDrawBuffers.COLOR_ATTACHMENT3_WEBGL;
          extDrawBuffers.drawBuffersWEBGL( drawbuffers );

          //Attach textures to FBO
          gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0 );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, drawbuffers[0], gl.TEXTURE_2D, textures[0], 0 );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, drawbuffers[1], gl.TEXTURE_2D, textures[1], 0 );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, drawbuffers[2], gl.TEXTURE_2D, textures[2], 0 );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, drawbuffers[3], gl.TEXTURE_2D, textures[3], 0 );

          var FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if( FBOstatus !== gl.FRAMEBUFFER_COMPLETE ){
              console.log( "GBuffer FBO incomplete! Initialization failed!" );
              return false;
          }

          // Create PBuffer FBO
          fbo[FBO_PBUFFER] = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[FBO_PBUFFER]);

          // Attach textures
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[4], 0);

          FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if(FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("PBuffer FBO incomplete! Initialization failed!");
            return false;
          }
        } else {
          fbo[FBO_GBUFFER_POSITION] = gl.createFramebuffer();
          
          // Set up GBuffer Position
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[FBO_GBUFFER_POSITION]);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[0], 0);

          var FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if (FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("GBuffer Position FBO incomplete! Init failed!");
            return false;
          }

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);

          fbo[FBO_PBUFFER] = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[FBO_PBUFFER]);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[4], 0);

          FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if (FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("PBuffer FBO incomplete! Init failed!");
            return false;
          }
          
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);

          // Set up GBuffer Normal
          fbo[FBO_GBUFFER_NORMAL] = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[FBO_GBUFFER_NORMAL]); 
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[1], 0);

          FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if (FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("GBuffer Normal FBO incomplete! Init failed!");
            return false;
          }

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);

          // Set up GBuffer Color
          fbo[FBO_GBUFFER_COLOR] = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[FBO_GBUFFER_COLOR]);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[2], 0);

          FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if (FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
            console.log("GBuffer Color FBO incomplete! Init failed!");
            return false;
          }
        }

        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl.bindTexture( gl.TEXTURE_2D, null );        
        
        return true;
     }

    return {
        ref: function(buffer){
        	return fbo[buffer];
        },
        initialize: function( gl, width, height ){
            return init( gl, width, height );
        },
        bind: function(gl, buffer){
            gl.bindFramebuffer( gl.FRAMEBUFFER, fbo[buffer] );
        },
        unbind: function(gl){
            gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        },
        texture: function(i){
            return textures[i];
        },
        depthTexture: function(){
            return depthTex; 
        },
        isMultipleTargets: function(){
          return multipleTargets;
        },
        ///// The following 3 functions should be implemented for all objects
        ///// whose resources are retrieved asynchronously
        isReady: function(){
        	var isReady = ready;
            for( var i = 0; i < textures.length; ++i ){
                isReady &= textures[i].ready;
            }
            console.log( isReady );
            return isReady;
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

