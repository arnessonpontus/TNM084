precision highp float;

varying vec3 vPosition;

void main() {

  
  if (length(vPosition) > 0.49) {
    discard;
  }

  if (vPosition.y > -0.17 && vPosition.y < -0.13) {
    gl_FragColor = vec4(sin(vPosition.x*100.)/2.+0.9,sin(vPosition.x*100.)/2.+0.9,sin(vPosition.x*100.)/2.+0.9,1.);
    //gl_FragColor = vec4(sin(vPosition.z*100.)/2.+0.8,sin(vPosition.z*100.)/2.+0.8,sin(vPosition.z*100.)/2.+0.8,1.);
    } else {
    gl_FragColor = vec4(1.,1.,1.,1.);
  }
}