precision highp float;
varying vec3 vPosition;
uniform float time;

void main() {

  // Discard nowflakes outside sphere
  if (length(vPosition) > 0.47) {
    discard;
  }

  gl_FragColor = vec4(1.,1.,1.,1.);
  
}