
precision highp float;

varying vec2 vUv;
varying vec3 vNorm;
varying vec3 vNormal;

uniform float theta;


void main() {
  vUv = uv;
  vNorm = position.xyz;
  vNormal = normal;

//  https://github.com/stackgl/shader-school/tree/master/exercises

//  float c = cos(theta);
//  float s = sin(theta);
//  mat2 rot = mat2(c, s, -s, c);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
