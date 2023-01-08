
uniform vec3 uColor;

void main() {
    float distanceLength = distance(gl_PointCoord, vec2(0.5));
    // distanceLength *=2.0;
    float strength = 1.0 - distanceLength;
    strength = step(0.5,strength);

    gl_FragColor = vec4(uColor,strength);
}