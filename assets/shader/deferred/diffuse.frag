precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

varying vec2 v_texcoord;

const vec3 light_pos = vec3( 10.0, 0.0, 10.0 );
const float light_intensity = 1.0;

float linearizeDepth( float exp_depth, float near, float far ){
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    // DEBUG: Pass color through.
    //gl_FragColor = vec4(texture2D(u_colorTex, v_texcoord).rgb, 1.0);

    vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
    vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
    vec3 color = texture2D( u_colorTex, v_texcoord ).rgb;

    float base_exp_depth = texture2D( u_depthTex, v_texcoord ).r;
    float base_depth = linearizeDepth( base_exp_depth, u_zNear, u_zFar );


    /*********** IMAGE-SPACE HORIZON-BASED AMBIENT OCCLUSION ***********/
    // Implementation inspired by: http://developer.download.nvidia.com/presentations/2008/SIGGRAPH/HBAO_SIG08b.pdf
    // Also inspired by: http://artis.inrialpes.fr/Membres/Olivier.Hoel/ssao/nVidiaHSAO/2317-abstract.pdf
/*
    // Define base angle from current fragment coordinates.
    float base_angle_deg = v_texcoord.s * v_texcoord.t;
    //float base_angle_deg = 0.0;

    // TODO: I might be computing the tangent vector incorrectly.

    // Define tangent vector to normal of current fragment.
    // Second vector of cross product is view direction.
    // Currently, view direction is assumed to point down the positive z-axis.
    vec3 t_vec = cross( normal, vec3( 0.0, 0.0, 1.0 ) );
    vec2 t_dir = normalize( vec2( t_vec.x, t_vec.y ) );

    float ao = 0.0;

    // Iterate through direction vectors emanating from current fragment.
    for ( int i = 0; i < NUM_DIRECTIONS; ++i ) {

        // Compute current direction vector.
        float angle_deg = base_angle_deg + ( float( i ) * ( 360.0 / float( NUM_DIRECTIONS ) ) );
        float angle_rad = angle_deg * ( PI / 180.0 );
        vec2 direction = normalize( vec2( cos( angle_rad ), sin( angle_rad ) ) );

        float largest_depth_diff = 0.0;

        // Define horizon variables.
        vec2 h_xy = v_texcoord;
        float h_z = base_depth;

        // Define tangent variables.
        vec2 t_xy = v_texcoord;
        float t_z = base_depth;

        // Step along current direction vector.
        for ( int step = 1; step <= NUM_SAMPLES; ++step ) {

            vec2 curr_pos = v_texcoord + ( float( step ) * direction );

            // Compute depth at current step along direction vector.
            float exp_depth = texture2D( u_depthTex, curr_pos ).r;
            float depth = linearizeDepth( exp_depth, u_zNear, u_zFar );

            // If difference in depth compared to depth of current fragment is the largest seen so far.
            if ( abs( depth - base_depth ) > largest_depth_diff ) {

                // Update horizon variables.
                largest_depth_diff = abs( depth - base_depth );
                h_xy = curr_pos;
                h_z = depth;

                // Update tangent variables.
                t_xy = v_texcoord + ( float( step ) * t_dir );
                exp_depth = texture2D( u_depthTex, t_xy ).r;
                t_z = linearizeDepth( exp_depth, u_zNear, u_zFar );
            }
        }

        float h_angle = atan( h_z / length( h_xy - v_texcoord ) );
        float t_angle = atan( t_z / length( t_xy - v_texcoord ) );
        ao += sin( h_angle ) - sin( t_angle );
    }

    vec3 ao_contribution = vec3( 1.0 - ao, 1.0 - ao, 1.0 - ao );
*/


    /*********** SCREEN-SPACE AMBIENT OCCLUSION ***********/
    // Implementation inspired by: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html

    // TODO: Implement this.

    // DEBUG - Pass color through.
    //gl_FragColor = vec4( texture2D( u_shadeTex, v_texcoord ).rgb, 1.0 );


    /*********** LAMBERTIAN SHADING ***********/

    float diffuse = max( dot( normal, normalize( light_pos - position ) ), 0.0 );
    gl_FragColor = vec4( diffuse * color * light_intensity, 1.0 );
}