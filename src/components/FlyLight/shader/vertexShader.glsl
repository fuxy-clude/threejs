precision lowp float;

varying vec2 vUv;
varying vec4 gPosition; // 当前物体的绝对position
varying vec4 mPosition; // 通过模型矩阵转换后的 position
void main(){
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 ) ;
    mPosition = modelPosition;
    gPosition = vec4( position, 1.0 );
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}