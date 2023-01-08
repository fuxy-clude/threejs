import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const parentEl = useRef<any>();
  useEffect(() => {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 1.创建平面纹理
    const planeSize = 80;
    const loader = new Three.TextureLoader();
    const texture = loader.load(require("@/assets/plane.png"));
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.magFilter = Three.NearestFilter;
    texture.repeat.set(planeSize / 2, planeSize / 2);
    // 平面几何体
    const planeGeometry = new Three.PlaneGeometry(planeSize, planeSize);
    // 平面材质
    const planeMaterial = new Three.MeshPhongMaterial({
      map: texture,
      side: Three.DoubleSide,
    });
    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * 0.5;

    const sphereGeomery = new Three.SphereGeometry(5);
    const sphere0 = new Three.Mesh(sphereGeomery, 
        new Three.MeshPhongMaterial({color: '#ffffff'}))
        sphere0.castShadow = true;
    sphere0.position.set(0,5,0);
    scene.add(sphere0)

    plane.receiveShadow = true;
    scene.add(plane);
    scene.add(new Three.AmbientLight(0xffffff, .1))

    const sphereMesh = new Three.Mesh(
        new Three.SphereGeometry(1),
        new Three.MeshPhongMaterial({color: 0xff0000})
    )
    sphereMesh.position.set(20, 20, 20)
    const pointLight = new Three.PointLight(0xff0000, 1, 100);
    pointLight.castShadow = true;
    pointLight.position.set(20, 20, 20)
    pointLight.shadow.radius = 20;
    pointLight.shadow.mapSize.set(1000, 1000)
    sphereMesh.castShadow = true;

    const lightGui = new Dat.GUI();
    lightGui.add(pointLight, 'intensity').min(0).max(2)
    lightGui.add(pointLight, 'distance').min(0).max(100)
    lightGui.add(pointLight, 'decay').min(0).max(2)



    sphereMesh.add(pointLight)
    console.log(sphereMesh)
    scene.add(sphereMesh);
    
    renderer.shadowMap.enabled = true;
    camera.lookAt(0, 0, 0);
    camera.position.set(planeSize /2, planeSize, planeSize /2);
    const axesHelper = new Three.AxesHelper(30);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);

    const clock = new Three.Clock()
    const render = () => {
        const time = clock.getElapsedTime()
        sphereMesh.position.x = Math.sin(time) * 13
        pointLight.position.x = Math.sin(time) * 13
        pointLight.position.y = 20 + Math.sin(time) * 13
        sphereMesh.position.y = 20 + Math.cos(time) * 13
        sphereMesh.position.z = Math.cos(time) * 13
        pointLight.position.z = Math.cos(time) * 13
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
