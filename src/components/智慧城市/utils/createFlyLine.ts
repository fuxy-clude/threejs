import * as Three from 'three';
import gsap from 'gsap'
export default class FlyLine {
    material: Three.Material;
    geometry: Three.TubeBufferGeometry;
    mesh: Three.Mesh;
    constructor() {
        const points = [
            new Three.Vector3(0,0,0),
            new Three.Vector3(4,4,0),
            new Three.Vector3(8,0,0)
        ]
        const lineCurve = new Three.CatmullRomCurve3(points, false);
        const map = new Three.TextureLoader().load(require('../assets/z_112.png'));
        map.repeat.y = 2;
        map.wrapT = Three.MirroredRepeatWrapping;
        map.wrapS = Three.RepeatWrapping;
        this.geometry = new Three.TubeBufferGeometry(lineCurve,200,.3,2,false);
        this.material = new Three.MeshBasicMaterial({
            map,
            transparent: true,
        })
        this.mesh = new Three.Mesh(this.geometry, this.material);
        

        gsap.to(map.offset, {
            x: -2,
            repeat: -1,
            duration: 2,
            ease: 'none'
        })
    }
}