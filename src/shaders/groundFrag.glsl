precision highp float;

varying vec3 vPosition;

void main() {

  // Prevent snow from escaping the sphere
  if (length(vPosition) > 0.49) {
    discard;
  }

  if (vPosition.y > -0.18 && vPosition.y < -0.12) {
    gl_FragColor = vec4(sin(vPosition.x*100.)/2.+0.9,sin(vPosition.x*100.)/2.+0.9,sin(vPosition.x*100.)/2.+0.9,0.1);
    } else {
    gl_FragColor = vec4(1.,1.,1.,1.);
  }
}