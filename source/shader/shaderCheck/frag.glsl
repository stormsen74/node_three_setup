
precision highp float;

varying float distFromCenter;
varying vec3 vNormal;
varying vec2 vUv;

void main () {
//  gl_FragColor = vec4(vec3(distFromCenter), 1.0);
    vec4 d = vec4(vec3(distFromCenter), 1.0);
     vec4 n = vec4(vNormal, .5);

  gl_FragColor = n;
  gl_FragColor = vec4( vec3( vUv, 0. ), 1. );
}