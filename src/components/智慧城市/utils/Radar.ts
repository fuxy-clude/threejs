import * as Three from 'three';
import gsap from 'gsap';
import vertexShader from '../shader/radar/vertex.glsl'
import fragmentShader from '../shader/radar/fragment.glsl'
import Gui from 'dat.gui';
export default class Radar {
    mesh: Three.Mesh
    material: Three.ShaderMaterial;
    constructor() {
        const geometry = new Three.PlaneBufferGeometry(4,4);
        this.material = new Three.ShaderMaterial({
            vertexShader,
            fragmentShader,
            side: Three.DoubleSide,
            transparent: true,
            uniforms: {
                uColor: {
                    value: new Three.Color(0xff0000)
                },
                uTime: {
                    value: 0
                }
            }
        })
        this.mesh = new Three.Mesh(geometry, this.material);
        this.mesh.rotation.x = - Math.PI/2;
        this.mesh.position.set(10,1,-9.5)

        const radar = new Gui.GUI().addFolder('雷达');
        radar.add(this.mesh.position, 'x', -40, 40)
        radar.add(this.mesh.position, 'y', -40, 40)
        radar.add(this.mesh.position, 'z', -40, 40)

        gsap.to(this.material.uniforms.uTime, {
            value: 1,
            repeat: -1,
            ease: 'none',
            duration: 1,
        })
    }
}