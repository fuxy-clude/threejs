import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import gsap from 'gsap'
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


    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('../../../dist/gltf/');
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader)

    let a0: Three.Mesh,b0: Three.Mesh;
    const params = {
        value: 0,
        value1: 0
    }
    gltfLoader.load(require('./assets/f4.glb'),gltf0 => {
        gltf0.scene.rotation.x = Math.PI;
        console.log(gltf0.scene)
        gltf0.scene.traverse((item: any) => {
            if (item.isMesh && item.material && item.material.name === 'Stem') {
                console.log(item)
                a0 = item
            }
            if (item.isMesh && item.material && item.material.name === 'Petal') {
                console.log(item)
                b0 = item
            }
        })
        gltfLoader.load(require('./assets/f2.glb'),gltf1 => {
            console.log('gltf1',gltf1)
            gltf1.scene.traverse((item: any) => {
                if (item.isMesh && item.material && item.material.name === 'Stem') {
                    console.log(item)
                    a0.geometry.morphAttributes.position = [
                        item.geometry.attributes.position
                    ]
                    a0.updateMorphTargets()
                }
                if (item.isMesh && item.material && item.material.name === 'Petal') {
                    console.log(item)
                    b0.geometry.morphAttributes.position = [
                        item.geometry.attributes.position
                    ]
                    b0.updateMorphTargets()
                }
            })

            
        gltfLoader.load(require('./assets/f1.glb'),gltf2 => {
            gltf2.scene.traverse((item: any) => {
                if (item.isMesh && item.material && item.material.name === 'Stem') {
                    console.log(item)
                    a0.geometry.morphAttributes.position.push(item.geometry.attributes.position)
                    a0.updateMorphTargets()
                }
                if (item.isMesh && item.material && item.material.name === 'Petal') {
                    console.log(item)
                    b0.geometry.morphAttributes.position.push(item.geometry.attributes.position)
                    b0.updateMorphTargets()
                }
            })

        })

        })
        scene.add(gltf0.scene)

    })

    gsap.to(params, {
        value: 1,
        duration: 3,
        onUpdate() {
            console.log(a0,'newValue',params.value)
            a0.morphTargetInfluences[0] = params.value
            b0.morphTargetInfluences[0] = params.value
        },
        onComplete() {
            gsap.to(params, {
                value1: 1,
                duration: 3,
                onUpdate() {
                    console.log(a0,'newValue',params.value)
                    a0.morphTargetInfluences[1] = params.value1
                    b0.morphTargetInfluences[1] = params.value1
                }
            })
        }
    })





    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);
    const pointLightColor = 0xffffff;
    const intensityPoint = 1;
    const pointLight = new Three.DirectionalLight(pointLightColor, intensityPoint);
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
