import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import fragmentShader from './shader/fragmentShader.glsl';
import vertexShader from './shader/vertexShader.glsl';
import {cloneDeep, floor} from 'lodash';
import gsap from 'gsap';
import { FireWork } from "./firework";
import {Water} from 'three/examples/jsm/objects/Water2'
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let fireworkArr: FireWork[] = [];
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
      
      (gltf.scene.children[0] as any).material=material;
      for(let i=0;i<40;i++) {
        positions.push(new Three.Vector3((Math.random() - 0.5)*100, (Math.random())*50, (Math.random() - 0.5)*300));
      }
      console.log(positions)
      positions.forEach(position => {
        createLight(position)
      })
    });

    gltfLoader.load(require('./assets/model/newyears_min.glb'), glb =>{
      scene.add(glb.scene);

      Promise.all([new Three.TextureLoader().loadAsync(require('@/assets/water/Water_1_M_Normal.jpg')),new Three.TextureLoader().loadAsync(require('@/assets/water/Water_2_M_Normal.jpg'))]).then(resp =>{
          console.log(resp)
          const water = new Water(new Three.PlaneGeometry(100,100, 1024,1024), {
              color: '#ff0000',
              textureHeight: 1024,
              textureWidth: 1024,
              normalMap0: resp[0],
              normalMap1: resp[1]
          });
          water.position.y = 1;
          water.rotation.x = -Math.PI * 0.5;
          scene.add(water);
      })
    })

    window.addEventListener('click', () =>{
      const targetPosition = {
          x: (Math.random() - 0.5) * 80,
          y: 20 + Math.floor(Math.random() * 10),
          z: Math.random() * 20
      }
      const currentFireWork = new FireWork({
          to: targetPosition,
          color: `hsl(${Math.floor(Math.random() * 360)},100%,60%)`
      })
      currentFireWork.addScene(scene);
      fireworkArr.push(currentFireWork)
  })
    

    const folder = new Dat.GUI().addFolder('ss');
    const params = {
      x: 0,
      y: 0,
      z: 0
    }
    camera.position.set(-22, 13, -24);
    folder.add(params, 'x', -50,50).onChange(v =>{
      camera.lookAt(v,params.y,params.z)
    })
    folder.add(params, 'y', 10,50).onChange(v =>{
      camera.lookAt(params.x,v,params.z)
    })
    folder.add(params, 'z', -50,50).onChange(v =>{
      camera.lookAt(params.x,params.y,v)
    })
    
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    camera.lookAt(9,10,4);
    oribit.update();

    const render = () => {
      fireworkArr.forEach((item,i) =>{
        const status = item.update()
        if (status === 'clear') {
          fireworkArr.splice(i,1)
        }
      })
      camera.lookAt(9,10,4);
      camera.updateProjectionMatrix();
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      // oribit.update();
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
