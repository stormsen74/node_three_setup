varying vec3 vNorm;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
  vUv = uv;
  vNorm = position.xyz;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
