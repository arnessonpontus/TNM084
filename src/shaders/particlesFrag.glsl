  precision highp float;
      varying vec3 vPosition;
      uniform float time;

      float rand( vec2 co ){
      	return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
      }

      void main() {

        float dist = sqrt(vPosition.x*vPosition.x+vPosition.y*vPosition.y+vPosition.z*vPosition.z);
      	gl_FragColor = vec4(1.,1.,1.,0.5)*(0.5-dist);//*(vPosition.y+0.2)*2.; //color
      }