varying vec2 vUv;
uniform float uTime;
#define PI 3.1415926535897932384626433832795

// 随机函数
float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}
void main(){
    // float strength = mod(vUv.x * 10.0, 1.0);
    // strength = step(0.8, strength);
    // strength -= step(0.8, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 旋转
    // vec2 rotateValue = rotate(vUv, uTime * 5.0, vec2(0.5));
    // float strength = 0.05 / distance(vec2(rotateValue.x, (rotateValue.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5));
    // strength += 0.05 / distance(vec2(rotateValue.y, (rotateValue.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 圆环1:
    // float strength = 1.0 - step(0.3, distance(vUv, vec2(0.5)));
    // strength *= (step(0.25, distance(vUv, vec2(0.5))));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 圆环2:
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.5));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 雷达
    // float angle = atan(vUv.x-0.5, vUv.y-0.5);
    // float strength = (angle + 3.14) / 6.28;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    float angle = atan(vUv.x-0.5, vUv.y-0.5) / (2.0 * PI);
    float strength = sin(angle*1000.0);
    gl_FragColor = vec4(strength, strength, strength, 1.0);
}
