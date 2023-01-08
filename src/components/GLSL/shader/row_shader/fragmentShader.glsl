precision highp float;
varying vec2 vUv;
varying float vModelZ;

uniform sampler2D uFlag;

void main(){
    // float zAxis = vModelZ + 1.0;
    // gl_FragColor = vec4(zAxis * 1.0, 0.0, 0.0, 1.0);

    vec4 texture = texture2D(uFlag, vUv);
    gl_FragColor = texture;
}