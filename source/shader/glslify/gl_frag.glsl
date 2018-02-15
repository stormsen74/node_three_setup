#extension GL_OES_standard_derivatives : enable
varying vec3 vViewPos;

#pragma glslify: faceNormal = require("glsl-face-normal")

void main() {
   vec3 normal = faceNormal(vViewPos);

  gl_FragColor = vec4(normal, 1.0);
 }