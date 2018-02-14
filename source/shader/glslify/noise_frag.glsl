

#extension GL_OES_standard_derivatives : enable

//precision highp float;

varying vec3 vNorm;
varying vec3 vNormal;
varying vec2 vUv;

uniform float iGlobalTime;
uniform vec3  iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#pragma glslify: noise = require("glsl-noise/simplex/3d")
#pragma glslify: checker = require("glsl-checker")
#pragma glslify: blend = require("glsl-blend-overlay")
#pragma glslify: halftone = require("glsl-halftone")


void main() {
  float n = noise(vec3(gl_FragCoord.xy * 0.005, iGlobalTime * .5));

  vec4 colorTexture_1 = texture2D(iChannel0, vUv);
  vec4 colorTexture_2 = texture2D(iChannel1, vUv);
  vec3 colorHalftone = halftone(colorTexture_1.rgb, vUv, 35.0);
  vec3 colorNoise = vec3(n);
  vec3 colorNorm = vNorm * 0.5 + 0.5;
  vec3 colorNormal = vNormal;
  vec3 colorChecker = vec3(checker(vUv, 15.0)) * 0.3;
//  vec3 colorResult = colorNormal + colorNoise;
  vec3 colorResult = colorNoise + vec3(colorHalftone.rgb);
//  vec4 colorResult = vec4(colorTexture.rgb, 1.0);

  gl_FragColor = vec4(colorResult, 1.0);

}