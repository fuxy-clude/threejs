precision lowp float;
varying vec2 vUv;
varying vec4 gPosition; // 绝对position
varying vec4 mPosition; // 通过模型矩阵转换后的 position

void main(){
    vec4 redColor = vec4(1,0,0,1);
    vec4 yellowColor = vec4(1,1,0,1);
    vec4 mixColor = mix(yellowColor, redColor, gPosition.y / 3.0);
    if(gl_FrontFacing) {
        gl_FragColor = vec4(mixColor.rgb - 0.5 - mPosition.y / 1000.0, 1.0);
    } else {
        gl_FragColor = vec4(mixColor.rgb - mPosition.y / 1000.0, 1.0);
    }
}