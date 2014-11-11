precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

float linearizeDepth( float exp_depth, float near, float far ){
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    // Write a diffuse shader and a Blinn-Phong shader
    // NOTE : You may need to add your own normals to fulfill the second's requirements
    //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);

    vec3 light_pos = vec3( 10.0, 0.0, -10.0 );
    float light_intensity = 0.2;

    vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
    vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
    vec3 color = texture2D( u_colorTex, v_texcoord ).rgb;

    float diffuse = max( dot( normal, normalize( light_pos - position ) ), 0.0 );
    gl_FragColor = vec4( diffuse * color * light_intensity, 1.0 );

    // TODO: Blinn-Phong.

    // TODO: Define light position and intensity.
}