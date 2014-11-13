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
const float EULER = 2.7182818284;
const float SIGMA = 0.8;

// Light constants.
const vec3 light_pos = vec3( 10.0, 0.0, 10.0 );

// Image dimensions.
const float WIDTH = 960.0;
const float HEIGHT = 540.0;

// Pixel step sizes.
const float HORIZONTAL_STEP = 1.0 / WIDTH;
const float VERTICAL_STEP = 1.0 / HEIGHT;

// Edge detection constants.
const float EDGE_DETECTION_THRESHOLD = 0.65;
const vec3 EDGE_COLOR = vec3( 0.0, 0.0, 0.0 );

// Blur constants.
const int CONVOLUTION_KERNEL_SIZE = 7;
const float GLOW_FACTOR = 1.0;
const int GLOW_WIDTH = 1;
const int GLOW_HEIGHT = 1;

float linearizeDepth( float exp_depth, float near, float far )
{
    return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

float computeGaussian( float x, float y )
{
    float part_1 = 1.0 / ( 2.0 * PI * pow( SIGMA, 2.0 ) );
    float part_2 = -1.0 * ( ( x * x + y * y ) / ( 2.0 * pow( SIGMA, 2.0 ) ) );
    return part_1 * pow( EULER, part_2 );
}

void main()
{
    // DEBUG: Pass color through.
    //gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0);

    // Get fragment data.
    vec3 position = texture2D( u_positionTex, v_texcoord ).xyz;
    vec3 normal = texture2D( u_normalTex, v_texcoord ).xyz;
    vec3 color = texture2D( u_colorTex, v_texcoord ).rgb;
    float base_exp_depth = texture2D( u_depthTex, v_texcoord ).r;
    float base_depth = linearizeDepth( base_exp_depth, u_zNear, u_zFar );


    /*********** TOON SHADER ***********/
    // Implementation inspired by: http://www.lighthouse3d.com/tutorials/glsl-tutorial/toon-shader-version-ii/
/*
    // Compute angle between fragment normal and light.
    float intensity = dot( normalize( light_pos - position ), normalize( normal ) );

    // Get passed-in color.
    vec3 toon_color = color;

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
        intensity = 1.0;
        toon_color = EDGE_COLOR;
    }
    else {

        // Put colors into "buckets" based on intensity of light.
        if ( intensity > 0.95 ) {
            intensity = 1.0;
            //toon_color = vec3( 1.0, 0.5, 0.5 );
        }
        else if ( intensity > 0.5 ) {
            intensity = 0.95;
            //toon_color = vec3( 0.6, 0.3, 0.3 );
        }
        else if ( intensity > 0.25 ) {
            intensity = 0.5;
            //toon_color = vec3( 0.4, 0.2, 0.2 );
        }
        else {
            intensity = 0.25;
            //toon_color = vec3( 0.2, 0.1, 0.1 );
        }
    }

    // Set fragement color.
    gl_FragColor = vec4( toon_color * intensity, 1.0 );
*/


    /*********** BLOOM ***********/
    // Apply a "glow" to edge fragments by blurring.
    // Implementation inspired by: http://http.developer.nvidia.com/GPUGems/gpugems_ch21.html
/*
    float accum = 0.0;

    // Check for edges.
    if ( dot( normal, neighbor_norm_1 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_2 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_3 ) < EDGE_DETECTION_THRESHOLD ||
         dot( normal, neighbor_norm_4 ) < EDGE_DETECTION_THRESHOLD )
    {
        for ( int x = -CONVOLUTION_KERNEL_SIZE / 2; x < CONVOLUTION_KERNEL_SIZE / 2; ++x ) {
            for ( int y = -CONVOLUTION_KERNEL_SIZE / 2; y < CONVOLUTION_KERNEL_SIZE / 2; ++y ) {
                accum += computeGaussian( abs( float( x ) ), abs( float( y ) ) ) * GLOW_FACTOR * texture2D( u_shadeTex, vec2( v_texcoord.s + ( float( x ) * HORIZONTAL_STEP ), v_texcoord.t + ( float( y ) * VERTICAL_STEP ) ) ).rgb;
            }
        }
    }

    gl_FragColor = vec4( texture2D( u_shadeTex, v_texcoord ).rgb + accum, 1.0 );
*/


    /*********** BLUR ***********/
/*
    vec3 blur_color = vec3( 0.0, 0.0, 0.0 );
    for ( int x = -CONVOLUTION_KERNEL_SIZE / 2; x < CONVOLUTION_KERNEL_SIZE / 2; ++x ) {
        for ( int y = -CONVOLUTION_KERNEL_SIZE / 2; y < CONVOLUTION_KERNEL_SIZE / 2; ++y ) {
            blur_color += computeGaussian( abs( float( x ) ), abs( float( y ) ) ) * GLOW_FACTOR * texture2D( u_shadeTex, vec2( v_texcoord.s + ( float( x ) * HORIZONTAL_STEP ), v_texcoord.t + ( float( y ) * VERTICAL_STEP ) ) ).rgb;
        }
    }
    gl_FragColor = vec4( blur_color, 1.0 );
*/

    // DEBUG - Pass color through.
    gl_FragColor = vec4( texture2D( u_shadeTex, v_texcoord ).rgb, 1.0 );
}