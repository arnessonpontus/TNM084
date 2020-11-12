precision highp float;

uniform float time;
uniform float storm;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute float size;
attribute float lifeTime;

varying vec3 vPosition;

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float rand( vec2 co ){
  return fract( sin( dot( co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );
}

vec2 curlNoise(vec2 p) {
	float x = p.x;
	float z = p.y;

	float epsilon = 0.001;
	float n1, n2, a, b;

	// Calc. gradients of the simplex noise using finite differences
	n1 = snoise(vec2(x, z + epsilon));
	n2 = snoise(vec2(x, z - epsilon));
	a = (n1 - n2) / (2. * epsilon);

	n1 = snoise(vec2(x + epsilon, z));
	n2 = snoise(vec2(x - epsilon, z));
	b = (n1 - n2) / (2. * epsilon);

	// Curl definition 2D
	return vec2(a, -b);
}

void main(){

	vPosition = position + offset;
	
	// Snow fall depening on lifetime to relocate snow
	vPosition.y = 0.6 - mod(time + 3., rand(vec2(lifeTime, lifeTime))) * lifeTime;

	float curlAmplitude = 0.2;
	float curlFrequency = 0.9;

	vec2 noise = curlAmplitude * curlNoise(vec2(curlFrequency * vec2(offset.x, offset.z) + vec2(0.4, 0.66) * time)) + vec2(position.x, position.z);
	noise += curlAmplitude/2.0 * curlNoise(vec2(curlFrequency * 3.5 * vec2(offset.x, offset.z) + vec2(0.4, 0.66) * time))+ vec2(position.x, position.z);
	noise += curlAmplitude/4.0 * curlNoise(vec2(curlFrequency * 5.0 * vec2(offset.x, offset.z) + vec2(0.4, 0.66) * time))+ vec2(position.x, position.z);

	// Add storm in x, z and some y direction
	vPosition.x += noise.x*storm;
	vPosition.z += noise.y*storm;

	// Add different sizes for snowflakes
	gl_PointSize = 2.5*lifeTime;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}