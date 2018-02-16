
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 uvColor;


void main() {
  vUv = uv;
  vPosition = position.xyz;
  vNormal = normal;

  uvColor = vec3(uv, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
