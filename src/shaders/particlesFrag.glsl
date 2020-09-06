  precision highp float;
      varying vec3 vPosition;
      uniform float time;

      float rand( vec2 co ){
      	return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
      }

      void main() {
        float distFromCenter = length(vPosition);
      	gl_FragColor = vec4(0.,1.,1.,1.)*(0.5-distFromCenter);//*(vPosition.y+0.2)*2.; //color
      }