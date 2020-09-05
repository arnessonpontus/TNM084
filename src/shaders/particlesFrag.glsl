  precision highp float;
      varying vec3 vPosition;
      uniform float time;

      float rand( vec2 co ){
      	return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
      }

      void main() {
      	gl_FragColor = vec4(1.,1.,1.,0.5)*vec4(vPosition[0],vPosition[1],vPosition[2],1); //color
      }