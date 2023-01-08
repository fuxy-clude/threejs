attribute vec3 uTargetVec;

uniform float uTime;
uniform float uSize;

void main() {
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 ) ;

    modelPosition.xyz += uTargetVec * uTime * 3.0;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    gl_PointSize = uSize;
}