

varying float distFromCenter;
varying vec3 vNormal;
uniform float time;

void main () {
  distFromCenter = distance(position.xyz, vec3(0.0));
  vNormal = normal;

   vec4 offset = vec4(position, 1.0);
//   float dist = 0.03;
   float dist = sin(time) * 0.1 + 0.1;
   offset.xyz += normal * dist;

//  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * offset;
}