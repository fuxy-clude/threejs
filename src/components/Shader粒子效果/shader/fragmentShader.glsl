
uniform sampler2D uTexture;

void main() {

    // float strength = distance(gl_PointCoord, vec2(0.5));
    // gl_FragColor = vec4(strength,strength,strength,1.0);
    vec4 textureColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(gl_PointCoord, textureColor.rb);
}