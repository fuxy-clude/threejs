/**
 * HRD文件加载
 */
import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
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

    const sphereGeometry = new Three.SphereGeometry(5, 32, 16);
    
    const rgbeLoader = new RGBELoader();
    rgbeLoader.loadAsync(require('@/assets/hdr/004.hdr')).then(texture => {
        texture.mapping = Three.EquirectangularReflectionMapping
        console.log(texture)
        const sphereMaterial = new Three.MeshStandardMaterial({
            envMap: texture,
            roughness: .2,
            metalness: .7,
        })
    const sphereMesh = new Three.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(5,5,5)
        scene.add(sphereMesh)
        scene.environment = texture
        scene.background = texture
    })
    

    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * 0.5;
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
