varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
// 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}
void main () {
    vec2 newVuv = rotate(vUv, uTime*6.28, vec2(0.5));
    float angle = atan(newVuv.x-0.5, newVuv.y-0.5);
    float strength = (angle + 3.14) / 6.28;
    float alph = 1.0 - step(0.5, distance(newVuv, vec2(0.5)));
    gl_FragColor = vec4(uColor, alph*strength);
}