varying vec3 vViewPos;
varying vec3 vPosition;

uniform float iGlobalTime;
uniform vec3  iResolution;
const float amplitude = 0.5;
const float frequency = 1000.0;
const float PI = 3.14159;

#pragma glslify: noise = require("glsl-noise/simplex/4d")
 
void main() {
  vec4 pos = vec4(position, 1.0);
  vec4 mpos = modelViewMatrix * pos;
//  gl_Position = projectionMatrix * mpos;
  vViewPos = -mpos.xyz;

   float n = noise(vec4(position * 0.005, iGlobalTime * .5));
   vec3 newPosition = position + normal * sin(iGlobalTime * 5.0);

    gl_Position =  projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }


