import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import gsap from "gsap";
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
const showType = {
  type: 1,
};
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

    const sphereGeometry = new Three.SphereGeometry(10, 30, 30);
    const sphereMaterial = new Three.PointsMaterial({
      color: 0xfff000,
    });
    sphereMaterial.transparent = true;
    sphereMaterial.blending = Three.AdditiveBlending;
    sphereMaterial.size = 0.1;
    const sphereMesh = new Three.Points(sphereGeometry, sphereMaterial);

    const pointMaterial = new Three.PointsMaterial({
      color: 0xfff000,
    });

    pointMaterial.vertexColors = true;
    pointMaterial.transparent = true;
    pointMaterial.blending = Three.AdditiveBlending;
    pointMaterial.size = 0.01;

    const count = 20000;
    const colors = new Float32Array(count * 3);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
      colors[i] = Math.random();
    }
    const sky = new Three.BufferGeometry();
    sky.setAttribute("position", new Three.BufferAttribute(positions, 3));
    sky.setAttribute("color", new Three.BufferAttribute(colors, 3));
    const skyMesh = new Three.Points(sky, pointMaterial);
    // scene.add(skyMesh);

    const xuehuaCount = 100000;
    const xuehuaPoints = new Float32Array(xuehuaCount * 3);
    const xuehuaMaterial = new Three.PointsMaterial({
      map: new Three.TextureLoader().load(require("@/assets/xuehua.png")),
      alphaMap: new Three.TextureLoader().load(require("@/assets/xuehua.png")),
      transparent: true,
      blending: Three.AdditiveBlending,
      size: 1,
    });
    for (let i = 0; i < xuehuaCount; i++) {
      xuehuaPoints[i*3] = (Math.random() - 0.5) * 200;
      xuehuaPoints[i*3+1] = (Math.random() - 0.5) * 200;
      xuehuaPoints[i*3+2] = (Math.random() - 0.5) * 200;
    }
    const xuehuaGeometry = new Three.BufferGeometry();
    xuehuaGeometry.setAttribute(
      "position",
      new Three.BufferAttribute(xuehuaPoints, 3)
    );
    const xuehuaMesh = new Three.Points(xuehuaGeometry, xuehuaMaterial);
    console.log(xuehuaMesh);
    scene.add(xuehuaMesh);
    camera.far = 32
    camera.updateProjectionMatrix()
    
    

    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    const axesHelper = new Three.AxesHelper(30);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    parentEl.current.appendChild(renderer.domElement);
    const clock = new Three.Clock();

    const toggle = new Dat.GUI();
    toggle.add(showType, 'type', 0, 1, 1).onChange(e =>{
        if (e === 0) {
            scene.add(sphereMesh)
            scene.add(skyMesh);
            scene.remove(xuehuaMesh)
            camera.far = 1000
            camera.updateProjectionMatrix()
        } else if (e===1) {
            scene.add(xuehuaMesh)
            scene.remove(sphereMesh);
            scene.remove(skyMesh)
            camera.far = 32
            camera.lookAt(0,0,0)
            camera.updateProjectionMatrix()
        }
    })
    const render = () => {
      xuehuaMesh.rotation.x += clock.getDelta() * 0.1;
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
