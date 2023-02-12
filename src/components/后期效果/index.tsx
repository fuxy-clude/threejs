import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {DotScreenPass} from 'three/examples/jsm/postprocessing/DotScreenPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
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


    // 后期合成器
    const effectComposer = new EffectComposer(renderer);
    effectComposer.setSize(window.innerWidth, window.innerHeight);

    // 合成通道
    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);
    // effectComposer.addPass(new DotScreenPass())
    const bloomPass = new UnrealBloomPass(new Three.Vector2(1,1), 1, 0, 1);
    renderer.toneMapping = Three.CineonToneMapping;
    renderer.toneMappingExposure = 1;
    effectComposer.addPass(bloomPass)

    const params = {
        r: 0,
        g: 0,
        b: 0.5
    }

    

    // 自定义后期效果
    const shaderPass = new ShaderPass({
        uniforms: {
            tDiffuse: {
                value: null
            },
            uColor: {
                value: new Three.Color(params.r, params.g, params.b)
            },
            uNormalMap: {
              value: null
            },
            uTime: {
              value: 0
            }
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,  1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D tDiffuse;
            uniform sampler2D uNormalMap;
            uniform vec3 uColor;
            uniform float uTime;
            void main() {
                vec2 newUv = vUv;
                newUv += sin(newUv.x*5.0+uTime)*0.01;
                vec4 color = texture2D(tDiffuse, newUv);
                vec4 normalMapColor = texture2D(uNormalMap, vUv);

                float colorNess = clamp(dot(normalMapColor.rgb, normalize(vec3(-5,5,0))), 0.0, 1.0);
                color.rgb += colorNess;
                gl_FragColor = color;
            }
        `
    });
    const normalMap = new Three.TextureLoader().load(require('./assets/textures/interfaceNormalMap.png'));
    shaderPass.material.uniforms.uNormalMap.value = normalMap;
    console.log(normalMap)

    const folder = new Dat.GUI().addFolder('颜色后期效果');
    folder.add(params, 'r', -1, 1).onChange(v => {
        shaderPass.uniforms.uColor.value.r = v;
    })
    folder.add(params, 'g', -1, 1).onChange(v => {
        shaderPass.uniforms.uColor.value.g = v;
    })
    folder.add(params, 'b', -1, 1).onChange(v => {
        shaderPass.uniforms.uColor.value.b = v;
    })

    effectComposer.addPass(shaderPass)
    
    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    const clock = new Three.Clock();
    const render = () => {
      requestAnimationFrame(render);
      shaderPass.material.uniforms.uTime.value = clock.getElapsedTime()
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
