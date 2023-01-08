

void main() {
    gl_PointSize = 200.0;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 ) ;
}