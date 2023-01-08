attribute vec3 randomSize;

uniform float uTime;
uniform float uSize;

void main() {
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 ) ;

    modelPosition.xyz += randomSize * uTime * 10.0;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    gl_PointSize = uSize;
}