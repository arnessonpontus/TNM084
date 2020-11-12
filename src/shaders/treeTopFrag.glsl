precision highp float;

varying vec3 vPosition;

void main() {
    // Snow border for tree top as sine wave
    float x = 0.08 + sin((vPosition.x + vPosition.z) * 90. * sin(vPosition.x + vPosition.z) * 19.) * 0.008;

    // Step at border to make white tip
    float stepY = step(x, vPosition.y);

    gl_FragColor = vec4(0.01 + stepY, 0.18 + stepY,0.04 + stepY, 1.);
}