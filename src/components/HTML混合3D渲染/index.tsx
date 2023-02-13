import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import {CSS2DObject, CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer'
import Gsap from 'gsap'
import { Clock } from "three";
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let camera: Three.PerspectiveCamera;
let curve: Three.CatmullRomCurve3;
export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const parentEl = useRef<any>();
  useEffect(() => {
    const scene = new Three.Scene();
    camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new Three.WebGL1Renderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 1.创建平面纹理
    const loader = new Three.TextureLoader();
      const bgTexture = loader.load(require('@/assets/moon/bg/starts.jpg'));

      const envLight = new Three.AmbientLight(0xffffff, 1)
      const directionalLight = new Three.SpotLight(0xffffff, 1);
      directionalLight.position.set(0, 0, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = .1;
      directionalLight.shadow.camera.far = 300;

      // directionalLight.distance = 200
      // directionalLight.decay = 2

      const lightGui = new Dat.GUI()
      lightGui.add(directionalLight, 'decay').min(0).max(10).step(0.1);
      lightGui.add(directionalLight, 'angle').min(0).max(Math.PI/2).step(Math.PI/10);
      lightGui.add(directionalLight, 'distance').min(0).max(200).step(10);
      scene.add(directionalLight)
      scene.add(directionalLight.target)
      const DirectionalLightHelper = new Three.SpotLightHelper(directionalLight);
      scene.add(DirectionalLightHelper)
    // 1. 添加背景
    scene.add(envLight)
    scene.background = bgTexture

    // 创建曲线
    curve = new Three.CatmullRomCurve3( [
      new Three.Vector3( -30, 0, 30 ),
      new Three.Vector3( -5, 5, 5 ),
      new Three.Vector3( 0, 0, 0 ),
      new Three.Vector3( 5, -5, 5 ),
      new Three.Vector3( 30, 0, 30 )
    ],true );
    const points = curve.getPoints(2000);
    const geometry = new Three.BufferGeometry();
    geometry.setFromPoints(points);
    const mesh = new Three.Line(geometry, new Three.LineDashedMaterial({color: '#fff000'}))
    mesh.position.set(0, 15,0)
    scene.add(mesh)

    // 标签渲染器
    const labelRender = new CSS2DRenderer()
    labelRender.setSize(window.innerWidth, window.innerHeight);
    labelRender.domElement.style.position = 'fixed';
    labelRender.domElement.style.top = '0px';
    labelRender.domElement.style.left = '0px';
    labelRender.domElement.style.zIndex = '99';
    document.body.appendChild(labelRender.domElement)
    // 加载纹理
    // 1. 颜色纹理
    const normalTexture = loader.load(require('@/assets/moon/textures/earth_normal_2048.jpg'))
    const colorTexture = loader.load(require('@/assets/moon/textures/earth_atmos_4096.jpg'))
    const specularTexture = loader.load(require('@/assets/moon/textures/earth_specular_2048.jpg'))
    const sphereBig = new Three.SphereGeometry(10, 1256, 1256);
    const sphereMaterial = new Three.MeshPhongMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      specularMap: specularTexture,
      shininess: 5,
    });
    const earth = new Three.Mesh(sphereBig, sphereMaterial);
    earth.rotation.x = -1.65;
    earth.rotation.z = .7;
    earth.receiveShadow = true;
    const earthLabelDiv = document.createElement('div');
    earthLabelDiv.setAttribute('style', "color: #333;font-size:16px;font-weight:700")
    earthLabelDiv.innerHTML = '南极'
    const earthLabel = new CSS2DObject(earthLabelDiv)
    earthLabel.position.set(0, .5, 0)
    earth.add(earthLabel)
    scene.add(earth)

    const moonTexture = loader.load(require('@/assets/moon/textures/moon_1024.jpg'))
    const moonSphere = new Three.SphereGeometry(1, 1256, 1256)
    const moon = new Three.Mesh(moonSphere, 
      new Three.MeshStandardMaterial({
        map: moonTexture,
        roughness: 0
      })
    )
    moon.castShadow = true;
    moon.position.set(15, 0, 0)
    const moonLabelDiv = document.createElement('div');
    moonLabelDiv.setAttribute('style', "color: #fff;font-size:16px;opacity: 0;")
    moonLabelDiv.textContent = 'Moon1'
    const moonLabel = new CSS2DObject(moonLabelDiv)
    moonLabel.position.set(0, 2, 0)
    moon.add(moonLabel)
    const clock = new Clock()
    scene.add(moon)


    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    oribit = new OrbitControls(camera, labelRender.domElement);
    oribit.enableDamping = true;
    const raycaster = new Three.Raycaster();
    document.body.appendChild(renderer.domElement);
    const render = () => {
      const time = clock.getElapsedTime()
      let index = time/10%1;
      let point = curve.getPoint(index);
      moon.position.copy(new Three.Vector3(point.x,point.y+15,point.z ))

    //   moon.position.x = Math.sin(time)*23
    //   moon.position.z = Math.cos(time)*23;
        // const moonPosition = moonLabel.position.clone();
        // moonPosition.project(camera);
        // const labelDistance = moonPosition.distanceTo(camera.position);
        // raycaster.setFromCamera(moonPosition, camera);
        // const intersects = raycaster.intersectObjects(scene.children, true);
        // if (intersects.length) {
        //     const minDistance = intersects[0].distance;
        //     if(minDistance<labelDistance){
        //         moonLabel.element.style.opacity = '1';
        //       }else{
        //         moonLabel.element.style.opacity = '0';
        //       }
        // }

      requestAnimationFrame(render);
      renderer.render(scene, camera);
      labelRender.render(scene, camera)
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
      renderer.setPixelRatio(window.devicePixelRatio)
      camera.updateProjectionMatrix();
      camera.aspect = window.innerWidth / window.innerHeight
    });
  }, []);
  return (
    <div
      style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px` }}
      ref={parentEl}
    ></div>
  );
}
