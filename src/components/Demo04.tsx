/**
 * 材质/纹理
 * 1.使用TextureLoader 纹理加载器加载纹理（就是图片）
 * 设置纹理 重复/x/y重复次数/偏移/旋转
 * loadingManager: 纹理/模型 加载Loading控制器
 */
import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useUpdate } from "ahooks";
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let doorTexture: any = null
export default function Demo03() {
  const progressEl = document.querySelector('#progress')
  const update = useUpdate()
  const [progressInfo, setProgress] = useState({
    current: 0,
    max: 0
  })
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
    const geometry = new Three.BoxGeometry(5, 5, 5);

    /**
     * loadingManager
     */
    const manager = new Three.LoadingManager()
    const textureLoader = new Three.TextureLoader(manager);
    doorTexture = textureLoader.load('./door.jpeg');
    doorTexture.needsUpdate = true;

    // 环境纹理贴图
    const zhalanTexture = textureLoader.load(require('@/assets/zhalan.jpeg'));

    manager.onLoad = () =>{
      console.log('加载完毕')
    }
    manager.onProgress = (url, loaded, total) => {
      console.log(url, loaded, total)
      setProgress({
        current: loaded,
        max: total,
      })
    }
    console.log('开始加载')

    // 纹理常用属性
    /**
     * 
     * MirroredRepeatWrapping: 镜像重复
     * RepeatWrapping普通重复
     */
    doorTexture.offset.x = 0.2
    doorTexture.rotation = .1 * Math.PI
    doorTexture.center.set(0.5 ,.5)
    doorTexture.repeat.set(2 ,3)
    // doorTexture.wrapS = Three.MirroredRepeatWrapping;
    doorTexture.wrapT = Three.RepeatWrapping;

    const folderTure = new Dat.GUI().addFolder('纹理属性')
    folderTure.add(doorTexture, 'wrapS', [Three.RepeatWrapping, Three.MirroredRepeatWrapping, Three.ClampToEdgeWrapping]).name('wrapS').onChange(() => doorTexture.needsUpdate = true)

    const material = new Three.MeshBasicMaterial({ color: 0xffffff, map: doorTexture, aoMap: zhalanTexture });
    /**
     * 添加平面
     */
    const planeGeometry = new Three.PlaneGeometry(3, 3)
    const plane = new Three.Mesh(
      planeGeometry,
      material
    )
    plane.position.set(10,0,0)

    scene.add(plane)
    
    // 给平面设置第二组uv
    // planeGeometry.setAttribute('uv', new Three.BufferAttribute(planeGeometry.attributes.))

    const mesh = new Three.Mesh(geometry, material);
    mesh.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);
    camera.position.set(30, 0, 30);
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    scene.add(mesh);
    parentEl.current.appendChild(renderer.domElement);
    const folder01 = new Dat.GUI().addFolder("控制器1");
    folder01.add(mesh.position, "y").min(0).max(30);
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
    <>
    <progress id="progress" max={progressInfo.max} value={progressInfo.current}></progress>
    <div
      style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px` }}
      ref={parentEl}
    ></div>
    </>
    
  );
}
