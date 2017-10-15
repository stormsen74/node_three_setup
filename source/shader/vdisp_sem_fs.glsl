
varying vec2 vUv;
varying float noise;
uniform sampler2D tExplosion;

uniform sampler2D tMatCap;
varying vec2 vN;

float random( vec3 scale, float seed ){
    return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

// https://github.com/jamieowen/glsl-blend

vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
	return (abs(base-blend) * opacity + base * (1.0 - opacity));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
	return (min(blend, base) * opacity + base * (1.0 - opacity));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (min(base+blend,vec3(1.0)) * opacity + base * (1.0 - opacity));
}




void main() {

    // get a random offset
    float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );
    // lookup vertically in the texture, using noise and offset
    // to get the right RGB colour
    vec2 tPos = vec2( 0, .7 - 1.3 * noise + r );
    vec3 color = texture2D( tExplosion, tPos ).rgb;

    vec3 matcap = texture2D( tMatCap, vN ).rgb;

    vec3 result = blendDifference  (color, matcap, 1.0);

    gl_FragColor = vec4( result, 1. );

//    gl_FragColor = vec4( color.rgb, 1.0 );

}