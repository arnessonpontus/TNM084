precision highp float;

varying vec3 vPosition;

void main() {

  // Prevent snow from escaping the sphere
  if (length(vPosition) > 0.49) {
    discard;
  }
  
  gl_FragColor = vec4(1., 1., 1., 1.);
}