/**
 * 贴图打造真实的门
 */
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
    // scene.background = new Three.Color('white')
    const camera = new Three.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 1.创建平面纹理
    const planeSize = 40;
    const loader = new Three.TextureLoader();
    const texture = loader.load(require('@/assets/plane.png'));
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.magFilter = Three.NearestFilter;
    texture.repeat.set(planeSize / 2, planeSize / 2);
    // 平面几何体
    const planeGeometry = new Three.PlaneGeometry(planeSize, planeSize);
    // 平面材质
    const planeMaterial = new Three.MeshBasicMaterial({
      map: texture,
      side: Three.DoubleSide,
    });
    // planeMaterial.color.setRGB(1.5, 1.5, 1.5);
    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * 0.5;
    // scene.add(plane);

    // 光源
    const directionalLight = new Three.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 20, -15);
    directionalLight.target.position.set(0,0,0);

    const directionalGui = new Dat.GUI();
    directionalGui
      .addColor(new ColorGuiHelp(directionalLight, "color"), "value")
      .name("方向光源color");
    directionalGui
      .add(directionalLight.position, "x")
      .name("方向光源x")
      .min(-planeSize)
      .max(planeSize);
    directionalGui
      .add(directionalLight.position, "y")
      .name("方向光源y")
      .min(0)
      .max(planeSize);
    directionalGui
      .add(directionalLight.position, "z")
      .name("方向光源z")
      .min(-planeSize)
      .max(planeSize);
    directionalGui.add(directionalLight, "intensity", 0, 2, 0.01).name("强度");
    const directionalHelp = new Three.DirectionalLightHelper(directionalLight);
    scene.add(directionalHelp);
    scene.add(directionalLight);

    // 门start
    // 导入门的纹理 1. 颜色贴图
    const colorTexture = loader.load(require('@/assets/door/color.jpg'));
    const doorAoTexture = loader.load('./door/ambientOcclusion.jpg');

    // 导入贴图
    //导入置换贴图
    const doorHeightTexture = loader.load(require('@/assets/door/height.jpg'));
    // 导入粗糙度贴图
    const roughnessTexture = loader.load(require('@/assets/door/roughness.jpg'));
    // 导入金属贴图
    const metalnessTexture = loader.load(require('@/assets/door/metalness.jpg'));
    // 导入法线贴图
    const normalTexture = loader.load(require('@/assets/door/normal.jpg'));

    const cubeGeometry = new Three.BoxBufferGeometry(5, 5, 5);
    const material = new Three.MeshStandardMaterial({
      map: colorTexture,
      displacementMap: doorHeightTexture,
      displacementScale: .1,
      roughness: 1,
      roughnessMap: roughnessTexture,
      metalnessMap: metalnessTexture,
      metalness:1,
      normalMap: normalTexture,
    })
    const doorMesh = new Three.Mesh(cubeGeometry, material);
    doorMesh.position.set(5, 5, 0)
    scene.add(doorMesh);



    // 门end
    camera.lookAt(0, 5, 0);
    camera.position.set(10, 20, -5);
    const axesHelper = new Three.AxesHelper(30);
    // renderer.setClearColor(0x666666, 0.8);
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
