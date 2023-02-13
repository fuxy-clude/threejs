import * as Three from 'three';
export default class MeshLine {
    material: Three.MeshBasicMaterial
    mesh: Three.LineSegments
    constructor(editMesh:Three.Mesh) {
        const edges = new Three.EdgesGeometry(editMesh.geometry);
        this.material = new Three.MeshBasicMaterial({color: 0xffff00});
        this.mesh = new Three.LineSegments(edges,this.material)
    }
}