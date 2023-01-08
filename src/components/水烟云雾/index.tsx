import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import fragmentShader from './shader/fragmentShader.glsl';
import vertexShader from './shader/vertexShader.glsl';
import {cloneDeep} from 'lodash';
import gsap from 'gsap';
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

    const pointLightColor = 0xffffff;
    const intensityPoint = 1;
    const pointLight = new Three.PointLight(pointLightColor, intensityPoint);
    pointLight.position.set(15, 20, -15);

    const params = {
      uWaresFrequency: 14,
      uScale: 0.03,
      uXzScale: 1.5,
      uNoiseFrequency: 10,
      uNoiseScale: 1.5,
      uLowColor: "#ff0000",
      uHighColor: "#ffff00",
      uXspeed: 1,
      uZspeed: 1,
      uNoiseSpeed: 1,
      uOpacity: 1,
      uTime: 0,
    };

    const shaderMaterial = new Three.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: Three.DoubleSide,
      uniforms: {
        uWaresFrequency: {
          value: params.uWaresFrequency,
        },
        uScale: {
          value: params.uScale,
        },
        uNoiseFrequency: {
          value: params.uNoiseFrequency,
        },
        uNoiseScale: {
          value: params.uNoiseScale,
        },
        uXzScale: {
          value: params.uXzScale,
        },
        uTime: {
          value: params.uTime,
        },
        uLowColor: {
          value: new Three.Color(params.uLowColor),
        },
        uHighColor: {
          value: new Three.Color(params.uHighColor),
        },
        uXspeed: {
          value: params.uXspeed,
        },
        uZspeed: {
          value: params.uZspeed,
        },
        uNoiseSpeed: {
          value: params.uNoiseSpeed,
        },
        uOpacity: {
          value: params.uOpacity,
        },
      },
      transparent: true,
    });

    const planeGeometry = new Three.PlaneGeometry(5,5,1512,1512);
    const planeMesh = new Three.Mesh(planeGeometry, shaderMaterial);
    planeMesh.rotation.x = - Math.PI / 2;
    scene.add(planeMesh);

    const gui  = new Dat.GUI().addFolder('水烟云雾');

    gui
  .add(params, "uWaresFrequency")
  .min(1)
  .max(100)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uWaresFrequency.value = value;
  });

gui
  .add(params, "uScale")
  .min(0)
  .max(0.2)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uScale.value = value;
  });

gui
  .add(params, "uNoiseFrequency")
  .min(1)
  .max(100)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uNoiseFrequency.value = value;
  });

gui
  .add(params, "uNoiseScale")
  .min(0)
  .max(5)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uNoiseScale.value = value;
  });

gui
  .add(params, "uXzScale")
  .min(0)
  .max(5)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uXzScale.value = value;
  });

gui.addColor(params, "uLowColor").onFinishChange((value) => {
  shaderMaterial.uniforms.uLowColor.value = new Three.Color(value);
});
gui.addColor(params, "uHighColor").onFinishChange((value) => {
  shaderMaterial.uniforms.uHighColor.value = new Three.Color(value);
});

gui
  .add(params, "uXspeed")
  .min(0)
  .max(5)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uXspeed.value = value;
  });

gui
  .add(params, "uZspeed")
  .min(0)
  .max(5)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uZspeed.value = value;
  });

gui
  .add(params, "uNoiseSpeed")
  .min(0)
  .max(5)
  .step(0.001)
  .onChange((value) => {
    shaderMaterial.uniforms.uNoiseSpeed.value = value;
  });

gui
  .add(params, "uOpacity")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    shaderMaterial.uniforms.uOpacity.value = value;
  });
    
    
    
    camera.lookAt(0, 0, 0);
    camera.position.set(10, 0, 10);
    const axesHelper = new Three.AxesHelper(10);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    const clock = new Three.Clock();
    const render = () => {
      const elapsedTime = clock.getElapsedTime();
      shaderMaterial.uniforms.uTime.value = elapsedTime;
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
