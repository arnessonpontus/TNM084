precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;

varying vec3 vPosition;

void main(){
	vPosition = position;
	if (vPosition.y > -0.15) {
		vPosition.y = -0.15;
	}

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition,1);
}