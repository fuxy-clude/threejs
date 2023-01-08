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

    /**
     * Main
     * 灯光与阴影，
     * 1. 材质需要满足对光照有反应： 基础材质无法对光有反应
     * 2. 设置渲染器开启阴影计算： renderer.shadowMap.enabled = true;
     * 3. 设置光照投射阴影 pointLight.castShadow = true;
     * 4. 设置物体投射阴影 sphereMesh.castShadow = true;
     * 5. 设置物体接收阴影 sphereMesh.receiveShadow = true;
     */
    const sphereGeometry = new Three.SphereGeometry(5, 32, 16);
    const sphereMaterial = new Three.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.1,
    });
    const sphereMesh = new Three.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.castShadow = true;
    sphereMesh.position.set(5, 5, 5);
    scene.add(sphereMesh);
    renderer.shadowMap.enabled = true;
    

    // 1.创建平面纹理
    const planeSize = 40;
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
    plane.receiveShadow = true;  
    scene.add(plane);
    const pointLightColor = 0xffffff;
    const intensityPoint = 1;
    const pointLight = new Three.PointLight(pointLightColor, intensityPoint);
    pointLight.position.set(15, 20, -15);
    const pointGui = new Dat.GUI();
    pointGui
      .addColor(new ColorGuiHelp(pointLight, "color"), "value")
      .name("点光源color");
    pointGui
      .add(pointLight.position, "x")
      .name("点光源x")
      .min(-planeSize)
      .max(planeSize);
    pointGui
      .add(pointLight.position, "y")
      .name("点光源y")
      .min(0)
      .max(planeSize);
    pointGui
      .add(pointLight.position, "z")
      .name("点光源z")
      .min(-planeSize)
      .max(planeSize);
    pointGui.add(pointLight, "intensity", 0, 2, 0.01).name("强度");
    const pointHelp = new Three.PointLightHelper(pointLight);
    pointLight.castShadow = true;
    pointLight.shadow.radius = 20;
    pointLight.shadow.mapSize.set(3000, 3000)
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 500;

    const gui = new Dat.GUI();
    gui.add(pointLight.shadow.camera, 'near').min(0).max(10).onChange(() =>{
        pointLight.shadow.camera.updateProjectionMatrix()
    })
    const shadowHelp = new Three.PointLightHelper(pointLight);
    scene.add(shadowHelp)


    scene.add(pointHelp);
    scene.add(pointLight);
    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    const render = () => {
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
