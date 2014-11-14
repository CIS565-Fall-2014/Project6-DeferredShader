//A loader for loading OBJ models
// Use the loaders in Three.js: http://threejs.org/

//CIS565WEBGLCORE is a core function interface
var CIS565WEBGLCORE = CIS565WEBGLCORE || {};

CIS565WEBGLCORE.createOBJLoader = function(){
    "use strict"

    var ready = false;
    var content;
    var callbackFunArray = [];

    var vertexGroup = [];
    var normalGroup = [];
    var texcoordGroup = [];
    var indexGroup = [];
    
    var textures = [];

    function initTexture( gl, url, index ){
        textures[index] = gl.createTexture();

        textures[index].image = new Image();
        textures[index].image.onload = function(){
          loadTexture( gl, textures[index] );
        }

        textures[index].image.src = url;
        textures[index].ready = false;
    }

    function loadTexture( gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.map.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture.ready = true;
    }


    function load( gl, filename, mtl ){
        var loader;

        var eventlistener = function(object){
            $('#loader').html("Some Assets take long to load, keep waiting, and don't kill the program. Loading...");
            content = object;
            console.log("load file: "+filename);
            console.log("children count: " + object.children.length );
            
        //Start parse vertices, normals, indices, and texcoords
            content.traverse( function(child){
            if( child instanceof THREE.Mesh ){
                    var numVertices = child.geometry.vertices.length;
                    var numFaces = child.geometry.faces.length;
                    var numTexcoords = child.geometry.faceVertexUvs[0].length;
                    var meshVertexArray = []; //vertex data
                    var meshNormalArray = [];
                    var meshIndexArray = [];
                    var meshTexcoordArray = [];
                    var point = 0;


                    console.log("start traverse OBJ");
                    if( numFaces != 0 ){
                        var texCount = textures.length;
                        console.log("texCount: " +texCount);
                        if( child.material.map !== null ){ 
                            console.log("child mat map ");
                            textures[texCount] = gl.createTexture();
                            textures[texCount].map = child.material.map;
                            //textures[texCount].map.image.src = child.material.map.image.src;
                            textures[texCount].ready = false;  
                           /* var url = child.material.map.image.toDataURL("image/jpeg", 1.0);
                            console.log("image url: "+url);
                            initTexture(gl,url, texCount);*/
                        
                          /*  for(var j = 0; j < texCount; j++){
                                console.log("child mat map src: " + child.material.map.image.src);
                                initTexture( gl, textures[texCount].map.src , j);  
                            }    */                     
                        }
                        else{
                            textures[texCount] = null;
                        }
                          //Array of texture coordinates of 1st layer texture 
                          var UVs = child.geometry.faceVertexUvs[0]; 

                        //Extract faces info (UVs, normals, indices)
                        for( var i = 0; i < numFaces;i++ ){

                            //Extract vertices info per face
                            var offset = child.geometry.faces[i].a;
                            meshVertexArray.push( child.geometry.vertices[offset].x);
                            meshVertexArray.push( child.geometry.vertices[offset].y);
                            meshVertexArray.push( child.geometry.vertices[offset].z);
                            offset = child.geometry.faces[i].b;
                            meshVertexArray.push( child.geometry.vertices[offset].x);
                            meshVertexArray.push( child.geometry.vertices[offset].y);
                            meshVertexArray.push( child.geometry.vertices[offset].z);
                            offset = child.geometry.faces[i].c;
                            meshVertexArray.push( child.geometry.vertices[offset].x);
                            meshVertexArray.push( child.geometry.vertices[offset].y);
                            meshVertexArray.push( child.geometry.vertices[offset].z);

                            meshIndexArray.push( i*3 );
                            meshIndexArray.push( i*3+1 );
                            meshIndexArray.push( i*3+2 );
                     
                            var offset = 3*child.geometry.faces[i].a;
                                        meshNormalArray[ 9*i ] = child.geometry.faces[i].normal.x;
                                        meshNormalArray[ 9*i+1 ] = child.geometry.faces[i].normal.y;
                                        meshNormalArray[ 9*i+2 ] = child.geometry.faces[i].normal.z;
                                        
                            offset = 3*child.geometry.faces[i].b; 
                                        meshNormalArray[ 9*i+3 ] = child.geometry.faces[i].normal.x;
                                        meshNormalArray[ 9*i+4 ] = child.geometry.faces[i].normal.y;
                                        meshNormalArray[ 9*i+5 ] = child.geometry.faces[i].normal.z;
                                        
                            offset = 3*child.geometry.faces[i].c; 
                                        meshNormalArray[ 9*i+6 ] = child.geometry.faces[i].normal.x;
                                        meshNormalArray[ 9*i+7 ] = child.geometry.faces[i].normal.y;
                                        meshNormalArray[ 9*i+8 ] = child.geometry.faces[i].normal.z;


                            var uv = UVs[i];
                            offset = 2*child.geometry.faces[i].a;
                            meshTexcoordArray[ 6*i ]   = uv[0].x;
                            meshTexcoordArray[ 6*i+1 ] = 1.0 - uv[0].y;

                            offset = 2*child.geometry.faces[i].b;
                            meshTexcoordArray[ 6*i+2 ]   = uv[1].x;
                            meshTexcoordArray[ 6*i+3 ] = 1.0 - uv[1].y;

                            offset = 2*child.geometry.faces[i].c;
                            meshTexcoordArray[ 6*i+4 ]   = uv[2].x;
                            meshTexcoordArray[ 6*i+5 ] = 1.0 - uv[2].y;

                        }
                     // console.log( 'num of faces '+numFaces);

                      vertexGroup.push( meshVertexArray );
                      normalGroup.push( meshNormalArray );
                      texcoordGroup.push( meshTexcoordArray );
                      indexGroup.push( meshIndexArray );
                    }
                }
            });
            //Indicate the loading is completed
            ready = true;
            $('#loader').html("Loading Complete. Enjoy!");
        };

        if( mtl === null ){
            console.log("no material: using obj THREE loader");
            loader = new THREE.OBJLoader();
            loader.load( filename, eventlistener );
        }
        else{
            console.log("has material: using obj THREE mtl loader");
            loader = new THREE.OBJMTLLoader();
            loader.load(filename,mtl,eventlistener);
        }

    }

    return {
        ref: function(){
            return content;
        },
        loadFromFile: function( gl, name, mtl){
            load( gl,name,mtl );
        },
        numGroups: function(){
            return vertexGroup.length;
        },
        vertices: function(i){
            return vertexGroup[i];
        },
        normals: function(i){
            return normalGroup[i];
        },
        indices: function(i){
            return indexGroup[i];
        },
        texcoords: function(i){
            return texcoordGroup[i];
        },
        numTextures: function(){
            return textures.length;
        },
        texture: function(i){
            return textures[i];
        },
        ///// The following 3 functions should be implemented for all objects
        ///// whose resources are retrieved asynchronously
        isReady: function(){
            var isReady = ready;
            for( var i = 0; i < textures.length; ++i ){
                if( textures[i] !== null && !textures[i].ready ){

                    if( textures[i].map.image.src.length > 0){
                        console.log( textures[i].map.image.src );
                        loadTexture( gl, textures[i] );
                        isReady &= textures[i].ready;
                    }
                }
            }

          console.log( "obj textures ready? =" + isReady );
          return isReady;
        },
        addCallback: function( functor ){
            callbackFunArray[callbackFunArray.length] = functor;
        },
        executeCallBackFunc: function(){
            var i;
            for( i = 0; i < callbackFunArray.length; ++i ){
                callbackFunArray[i]();
				//console.log(callbackFunArray[i]);
            }
        }       
    };

};

// Model object that creates vbo, ibo and nbo upon creation
var Model = function (gl, objLoader) {
  var numGroups = objLoader.numGroups();
  var vbo = [];
  var ibo = [];
  var nbo = [];
  var tbo = [];
  var iboLength = [];

  for (var i = 0; i < numGroups; i++) {
    // Initialize buffer objects
    vbo[i] = gl.createBuffer();
    ibo[i] = gl.createBuffer();
    nbo[i] = gl.createBuffer();
    tbo[i] = gl.createBuffer();
    // Add vbo, ibo, nbo and tbo
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objLoader.vertices(i)), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo[i]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objLoader.normals(i)), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo[i]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objLoader.indices(i)), gl.STATIC_DRAW);

       gl.bindBuffer(gl.ARRAY_BUFFER, tbo[i]);
   // console.log("texture coord number: " + objLoader.texcoords(i).length);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(objLoader.texcoords(i)), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    iboLength.push(objLoader.indices(i).length);
	//console.log("creating Model with indices: "+ objLoader.indices(i).length);
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
    tbo: function(i){
        return tbo[i];
    },
    texture: function(){
        return objLoader.texture(i);
    },
    numGroups: function() {
      return numGroups;
    },
    iboLength: function(i) {
      return iboLength[i];
    }
  }
};


  
