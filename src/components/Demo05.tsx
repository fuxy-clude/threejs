import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let material:any;
export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const parentEl = useRef<any>();
  useEffect(() => {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new Three.BoxGeometry(5, 5, 5);

    const textureLoader = new Three.TextureLoader();
    const px16Png = textureLoader.load(require('@/assets/16px.png'));
    const folderTure = new Dat.GUI().addFolder('纹理设置')
    folderTure.add(px16Png,'magFilter', [Three.LinearFilter, Three.NearestFilter]).name('magFilter').onChange(() => material.needsUpdate = true)
    folderTure.add(px16Png, 'minFilter', [Three.LinearFilter, Three.NearestFilter, Three.LinearMipMapLinearFilter, Three.LinearMipmapNearestFilter]).onChange(() => material.needsUpdate = true)
    console.log(folderTure)
    // px16Png.magFilter = Three.
    material = new Three.MeshBasicMaterial({ color: 0xffffff, map: px16Png });
    const mesh = new Three.Mesh(geometry, material);
    mesh.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 10, 30);


    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.target.set(0, 5, 0)
    oribit.enableDamping = true;
    scene.add(axesHelper);
    scene.add(mesh);
    parentEl.current.appendChild(renderer.domElement);
    const folder01 = new Dat.GUI().addFolder("控制器1");
    folder01.add(mesh.position, "y").min(0).max(30);
    const render = () => {
      material.needsUpdate = true;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      oribit.update();
    };
    render();
  }, []);
  useEffect(() => {
    window.addEventListener("resize", () => {
      setSizeInfo({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }, []);
  return (
    <div
      style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px` }}
      ref={parentEl}
    ></div>
  );
}
