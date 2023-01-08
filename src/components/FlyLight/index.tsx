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

    const material = new Three.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: Three.DoubleSide,
    })

    const rgbLoader = new RGBELoader();
    rgbLoader.loadAsync(require('./assets/2k.hdr')).then(texture =>{ 
      console.log(texture)
      texture.mapping = Three.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
      renderer.toneMapping = Three.ACESFilmicToneMapping;
      renderer.outputEncoding = Three.sRGBEncoding;
      renderer.toneMappingExposure = 0.2;
    })

    const gltfLoader = new GLTFLoader();
    let light: GLTF = null;
    let positions: Three.Vector3[] = [];
    const createLight = (position: Three.Vector3 = new Three.Vector3(0,0,0)) => {
      let cloneFly = light.scene.clone(true);
      cloneFly.position.copy(position);
      gsap.to(cloneFly.rotation, {
        y: Math.PI * 2,
        repeat: -1,
        duration: 10,
      })
      scene.add(cloneFly);
    };
    gltfLoader.load(require('./assets/flyLight.glb'), gltf =>{
      // gltf.scene.matri
      light = gltf;
      console.log(gltf);
      
      (gltf.scene.children[1] as any).material=material;
      for(let i=0;i<100;i++) {
        positions.push(new Three.Vector3((Math.random() - 0.5)*500, (Math.random())*500, (Math.random() - 0.5)*500));
      }
      console.log(positions)
      positions.forEach(position => {
        createLight(position)
      })
    });
    

    
    
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
