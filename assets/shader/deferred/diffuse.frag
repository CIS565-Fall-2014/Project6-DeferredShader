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
    // DEBUG: Pass color through.
    //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);

    vec3 light_pos = vec3( 10.0, 0.0, 10.0 );
    float light_intensity = 1.0;

    vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
    vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
    vec3 color = texture2D( u_colorTex, v_texcoord ).rgb;

    // Apply simple Lambertian shading.
    float diffuse = max( dot( normal, normalize( light_pos - position ) ), 0.0 );
    gl_FragColor = vec4( diffuse * color * light_intensity, 1.0 );

    // TODO: Blinn-Phong.

    // TODO: Make light position and intensity uniforms.

    // TODO: Add material specularity as a uniform.

    //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);
}