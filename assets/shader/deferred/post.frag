precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_colorTex;
uniform sampler2D u_depthTex;

uniform sampler2D u_shadeTex;

uniform float u_zNear;
uniform float u_zFar;

varying vec2 v_texcoord;

// Number of direction vectors to walk for each pixel.
const int NUM_DIRECTIONS = 4;

// Number of steps to take along each direction vector to determine horizon.
const int NUM_SAMPLES = 6;

// Distance to move along a direction vector for each sample.
const float STEP_SIZE = 0.001;

// Math constants.
const float PI = 3.1415926535;

// Light constants.
const vec3 light_pos = vec3( 10.0, 0.0, 10.0 );

// Image dimensions.
const float WIDTH = 960.0;
const float HEIGHT = 540.0;

// Pixel step sizes.
const float HORIZONTAL_STEP = 1.0 / WIDTH;
const float VERTICAL_STEP = 1.0 / HEIGHT;

// Edge detection constants.
float EDGE_DETECTION_THRESHOLD = 0.6;
vec3 EDGE_COLOR = vec3( 0.0, 0.0, 0.0 );

float linearizeDepth( float exp_depth, float near, float far ){
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    // DEBUG: Pass color through.
    //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0);

    // Get fragment data.
    vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
    vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
    float base_exp_depth = texture2D( u_depthTex, v_texcoord ).r;
    float base_depth = linearizeDepth( base_exp_depth, u_zNear, u_zFar );


    /*********** IMAGE-SPACE HORIZON-BASED AMBIENT OCCLUSION ***********/
    // Implementation inspired by: http://developer.download.nvidia.com/presentations/2008/SIGGRAPH/HBAO_SIG08b.pdf
    // Also inspired by: http://artis.inrialpes.fr/Membres/Olivier.Hoel/ssao/nVidiaHSAO/2317-abstract.pdf

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


    /*********** TOON SHADER ***********/
    // Implementation inspired by: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/

    // Compute angle between fragment normal and light.
    float intensity = dot( normalize( light_pos - position ), normalize( normal ) );

    // Get normals of neighboring fragments.
    vec3 neighbor_norm_1 = texture2D( u_normalTex, vec2( v_texcoord.s - HORIZONTAL_STEP, v_texcoord.t ) ).xyz;  // Edge detection - Left.
    vec3 neighbor_norm_2 = texture2D( u_normalTex, vec2( v_texcoord.s + HORIZONTAL_STEP, v_texcoord.t ) ).xyz;  // Edge detection - Right.
    vec3 neighbor_norm_3 = texture2D( u_normalTex, vec2( v_texcoord.s, v_texcoord.t - VERTICAL_STEP ) ).xyz;    // Edge detection - Down.
    vec3 neighbor_norm_4 = texture2D( u_normalTex, vec2( v_texcoord.s, v_texcoord.t + VERTICAL_STEP ) ).xyz;    // Edge detection - Up.

    // Check for edges.
    if ( dot( normal, neighbor_norm_1 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_2 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_3 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_4 ) < EDGE_DETECTION_THRESHOLD )
    {
        intensity = 0.0;
    }
    else {

        // Put colors into "buckets" based on intensity of light.
        if ( intensity > 0.95 ) {
            intensity = 1.0;
        }
        else if ( intensity > 0.5 ) {
            intensity = 0.95;
        }
        else if ( intensity > 0.25 ) {
            intensity = 0.5;
        }
        else {
            intensity = 0.25;
        }
    }

    // Set fragement color.
    //gl_FragColor = vec4( texture2D( u_shadeTex, v_texcoord ).rgb * intensity, 1.0 );


    /*********** BLOOM ***********/

    // TODO: Bloom.

    // DEBUG - Pass color through.
    gl_FragColor = vec4( texture2D( u_shadeTex, v_texcoord ).rgb, 1.0 );
}