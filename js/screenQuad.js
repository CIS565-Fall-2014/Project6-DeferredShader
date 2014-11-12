//screen quad geometry

var screenQuad ={
    vertices: [
    	-1.0, -1.0, 0.0,
    	1.0, -1.0, 0.0,
    	1.0, 1.0, 0.0,
    	-1.0, 1.0, 0.0
    ],
    texcoords:[
      1.0, 0.0,
      0.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ],
    indices: [
      0, 1, 3,
      3, 1, 2
    ]

};
