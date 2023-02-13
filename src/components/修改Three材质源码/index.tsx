import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass'
import {DotScreenPass} from 'three/examples/jsm/postprocessing/DotScreenPass'
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
    // 添加环境纹理
    const cubeTextureLoader = new Three.CubeTextureLoader();
    const imgs = [
        require("./assets/textures/environmentMaps/0/px.jpg"),
        require("./assets/textures/environmentMaps/0/nx.jpg"),
        require("./assets/textures/environmentMaps/0/py.jpg"),
        require("./assets/textures/environmentMaps/0/ny.jpg"),
        require("./assets/textures/environmentMaps/0/pz.jpg"),
        require("./assets/textures/environmentMaps/0/nz.jpg"),
        ]
        console.log(imgs)
    const envMapTexture = cubeTextureLoader.load(imgs);
    scene.environment = envMapTexture;
    scene.background = envMapTexture;

    const textureLoader = new Three.TextureLoader();
    // 加载模型纹理
    const modelTexture = textureLoader.load(require('./assets/color.jpg'));
    // 加载模型的法向纹理
    const normalTexture = textureLoader.load(require('./assets/normal.jpg'))
    const pointLightColor = 0xffffff;
    const intensityPoint = 1;
    const pointLight = new Three.DirectionalLight(pointLightColor, intensityPoint);
    pointLight.castShadow = true;
    pointLight.position.set(0,0,30);

    const basicUniforms = {
        uTime: {
            value: 0
        }
    }
    const material = new Three.MeshStandardMaterial({
        map:modelTexture,
        normalMap:normalTexture
    })

    material.onBeforeCompile = (shader) => {
        // #include <common>
        // #include <begin_vertex>
        console.log(shader.vertexShader);
        (shader.uniforms as any).uTime = basicUniforms.uTime;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            mat2 rotate2d(float _angle){
              return mat2(cos(_angle),-sin(_angle),
                          sin(_angle),cos(_angle));
            }
            uniform float uTime;
            `
          )
        shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
            `
            #include <beginnormal_vertex>
            float angle = sin(position.y+uTime) *0.5;
            mat2 rotateMatrix = rotate2d(angle);
            
            
            objectNormal.xz = rotateMatrix * objectNormal.xz;
            `
          )
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            // float angle = transformed.y*0.5;
            // mat2 rotateMatrix = rotate2d(angle);
            
            
            transformed.xz = rotateMatrix * transformed.xz;
        
        
            `
          )
    }

    const depthMaterial = new Three.MeshDepthMaterial({
        depthPacking:Three.RGBADepthPacking
      })
      
      depthMaterial.onBeforeCompile = (shader)=>{
        console.log(123);
        (shader.uniforms as any).uTime = basicUniforms.uTime;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          mat2 rotate2d(float _angle){
            return mat2(cos(_angle),-sin(_angle),
                        sin(_angle),cos(_angle));
          }
          uniform float uTime;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float angle = sin(position.y + uTime) *0.5 * PI;
          mat2 rotateMatrix = rotate2d(angle);
          
          
          transformed.xz = rotateMatrix * transformed.xz;
      
      
          `
        )
      
      }

    const plane = new Three.Mesh(new Three.PlaneGeometry(30, 30, 1024, 1024), new Three.MeshStandardMaterial({
        color: '#fff'
    }));
    plane.receiveShadow = true;
    plane.position.z = -5;
    scene.add(plane)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(require('./assets/LeePerrySmith.glb'), gltf =>{
        const mesh = gltf.scene.children[0];
        mesh.castShadow = true;
        (mesh as any).material = material;
        mesh.customDepthMaterial = depthMaterial;
        scene.add(mesh);
    })


   

    scene.add(pointLight);
    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;

    // 后期效果合成器
    const effectComposer = new EffectComposer(renderer);
    effectComposer.setSize(window.innerWidth, window.innerHeight)

    // 增加渲染通道
    const renderPass = new RenderPass(scene,camera)
    effectComposer.addPass(renderPass)
    // 添加合成效果
    const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight)
    effectComposer.addPass(smaaPass)

    const clock = new Three.Clock();
    const render = () => {
        basicUniforms.uTime.value = clock.getElapsedTime();
      requestAnimationFrame(render);
      effectComposer.render();
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
