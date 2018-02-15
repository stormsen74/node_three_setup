

uniform sampler2D iChannel2;
varying vec2 vN;

void main() {

	vec3 base = texture2D( iChannel2, vN ).rgb;
	gl_FragColor = vec4( base, 1. );

}