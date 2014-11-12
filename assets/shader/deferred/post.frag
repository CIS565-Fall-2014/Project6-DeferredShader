precision highp float;

uniform sampler2D u_shadeTex;
uniform vec2 u_resolution;

varying vec2 v_texcoord;

const float bloom_fac = 0.02;
const float bloom_rad = 0.0;


float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
    vec3 sum = texture2D(u_shadeTex, v_texcoord).rgb;

    if (bloom_rad > 0.0) {
        for (float x = -bloom_rad; x <= bloom_rad; ++x) {
            for (float y = -bloom_rad; y <= bloom_rad; ++y) {
                float inten = 1.0 - sqrt(x * x + y * y) / bloom_rad;
                if (inten > 0.0 && x != 0.0 && y != 0.0) {
                    vec2 tc = v_texcoord + vec2(x, y) / u_resolution;
                    sum += inten * clamp(texture2D(u_shadeTex, tc).rgb - vec3(0.5), 0.0, 1.0) * bloom_fac;
                }
            }
        }
    }

    gl_FragColor = vec4(sum, 1.0);
}
