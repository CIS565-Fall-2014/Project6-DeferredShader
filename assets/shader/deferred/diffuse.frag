precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform float u_zFar;
uniform float u_zNear;
uniform int u_displayType;

uniform mat4 u_projection;

varying vec2 v_texcoord;

// Lighting constants.
const vec3 LIGHT_POS = vec3( 10.0, 0.0, 10.0 );
const float LIGHT_INTENSITY = 1.0;
const vec3 LIGHT_COLOR = vec3( 1.0, 1.0, 1.0 );
const vec3 AMBIENT_COLOR = vec3( 0.1, 0.0, 0.0 );
const vec3 SPECULAR_COLOR = vec3( 1.0, 1.0, 1.0 );
const float SPECULAR_EXPONENT = 32.0;

// Horizon-based AO constants.
const int NUM_DIRECTIONS = 4;   // Number of direction vectors to walk for each pixel.
const int NUM_SAMPLES = 6;      // Number of steps to take along each direction vector to determine horizon.
const float STEP_SIZE = 0.001;  // Distance to move along a direction vector for each sample.

// Screen-space AO constants.
const float AO_NUM_SAMPLES = 8.0;
const float AO_RADIUS = 0.005;

// Math constants.
const float PI = 3.1415926535;

const float DEPTH_THRESHOLD = 0.99;

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

    vec3 normal_screen_space = normalize( u_projection * vec4( normal, 0.0 ) ).xyz;

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
    gl_FragColor = vec4( ao_contribution, 1.0 );
*/


    /*********** SCREEN-SPACE AMBIENT OCCLUSION ***********/
    // Naive implementation inspired by: http://john-chapman-graphics.blogspot.co.uk/2013/01/ssao-tutorial.html
/*
    float ao_total_samples = 0.0;
    float ao_visible_samples = 0.0;

    vec3 fragment_point = vec3( v_texcoord, texture2D( u_depthTex, v_texcoord ).r );

    // Generate random points on surface of sphere centered at origin.
    for ( float theta = -PI / 2.0; theta < PI / 2.0; theta += PI / AO_NUM_SAMPLES ) {
        for ( float phi = 0.0; phi < 2.0 * PI; phi += ( 2.0 * PI ) / AO_NUM_SAMPLES ) {

            // Convert spherical points to Cartesian points.
            float x = AO_RADIUS * sin( phi ) * cos( theta );
            float y = AO_RADIUS * sin( phi ) * sin( theta );
            float z = AO_RADIUS * cos( phi );

            vec3 spherical_point_dir = vec3( x, y, z );

            // Skip point if it is not in the normal-aligned hemisphere.
            if ( dot( spherical_point_dir, normal_screen_space ) >= 0.0 ) {

                // Get position and depth of point.
                vec3 hemisphere_point = fragment_point + spherical_point_dir;
                float gbuffer_depth = texture2D( u_depthTex, hemisphere_point.xy ).r;

                if ( hemisphere_point.z < gbuffer_depth && linearizeDepth( gbuffer_depth, u_zNear, u_zFar ) < DEPTH_THRESHOLD ) {
                    ao_visible_samples += 1.0;
                }

                ao_total_samples += 1.0;
            }
        }
    }

    // More visible samples means fragment is less occluded and more light reaches it.
    gl_FragColor = vec4( vec3( ao_visible_samples / ao_total_samples ), 1.0 );
*/


    /*********** LAMBERTIAN SHADING ***********/

    vec3 light_dir = normalize( LIGHT_POS - position );
    float diffuse = max( dot( normal, light_dir ), 0.0 );
    float specular = 0.0;

    if ( diffuse > 0.0 ) {

        vec3 view_dir = normalize( -position );

        vec3 half_dir = normalize( light_dir + view_dir );
        float spec_angle = max( dot( half_dir, normal ), 0.0);
        specular = pow( spec_angle, SPECULAR_EXPONENT );
    }

    gl_FragColor = vec4( AMBIENT_COLOR + diffuse * color + specular * SPECULAR_COLOR, 1.0 );

    //float diffuse = max( dot( normal, normalize( light_pos - position ) ), 0.0 );
    //gl_FragColor = vec4( diffuse * color * light_intensity, 1.0 );
}