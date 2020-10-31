precision highp float;
varying vec3 vPosition;
uniform float time;

float rand( vec2 co ){
  return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
}

void main() {

  // Discard nowflakes outside sphere
  if (length(vPosition) > 0.49) {
    discard;
  }

  
  gl_FragColor = vec4(1.,1.,1.,1.);
  
}