/**
 * 使用gasp动画库
 * 使用gltf加载外部素材
 * 使用dat库 调试参数工具
 */
import React, { useEffect, useRef, useState } from 'react'
import * as Three from 'three'
import {useSetState, useSize} from 'ahooks'
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Gsap from 'gsap';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import toukui from '@/assets/toukui.glb'
import * as Dat from 'dat.gui'

function webColorToHex(color: any): any {
  return parseInt(color.replace('#', '0x'))
}
let animate1: gsap.core.Tween = null as any;
export default function Demo01() {
  const parentEl = useRef<any>(null)
  const size = useSize(window.document.body)
  const [sizeInfo, setSizeInfo] = useState({width: window.innerWidth, height: window.innerHeight})
  const [threeSetting, setThreeSetting] = useSetState({
    scene: undefined as any,
    camera: undefined as any,
    renderer: undefined as any,
  })
  console.log(sizeInfo)

  useEffect(() => {
    // 创建场景
    const scene = new Three.Scene();
    // 创建摄像头
    const camera = new Three.PerspectiveCamera(75, parentEl?.current?.clientWidth / parentEl?.current?.clientHeight, 0.1, 1000)
    camera.position.set(0, 20, 40);
    const renderer = new Three.WebGLRenderer();
    const ambientLight = new Three.AmbientLight(webColorToHex('#c66111'))
    scene.add(ambientLight)
    renderer.setSize(parentEl?.current?.clientWidth, parentEl?.current?.clientHeight)

    parentEl?.current?.appendChild(renderer.domElement);

    /**
     * 正方体
     */
    const params = {
      fn: (value: any) =>{
        console.log(value)
      }
    }
    const geometry = new Three.BoxGeometry(3, 3, 3);
    const material = new Three.MeshBasicMaterial({color: '#ffffff'})
    const mesh = new Three.Mesh(geometry, material);
    mesh.position.set(5, 0 ,0)
    scene.add(mesh);

    const controlFolders = new Dat.GUI().addFolder('设置正方体');
    controlFolders.add(mesh.material, 'wireframe');
    controlFolders.add(mesh.position, 'x').min(mesh.position.x).max(20).name('设置水平位置');
    controlFolders.add(mesh, 'visible').name('设置显示隐藏')
    controlFolders.add(mesh.rotation, 'y').min(0).max(2 * Math.PI).name('旋转')

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.target.position.set(0,0,0);
    light.position.set(20,20,20);
    scene.add(light);
    scene.add(light.target)
    scene.add(new Three.DirectionalLightHelper(light))
    new Dat.GUI().add(light.position, "x").min(0).max(30).name('x轴移动')

    // 加载gltf模型
    const loader = new GLTFLoader();
    let t: Three.Group = null as any;
    loader.load(toukui, (gltf: GLTF) => {
      console.log(gltf);
      const gltfScene = gltf.scene;
      t = gltfScene;
      gltfScene.traverse((e) => {
        console.log(e)
        e.position.set(0,0,0)
        e.scale.set(1, 1, 1)
      })
      scene.add(gltfScene)
      new Dat.GUI().add(gltfScene.position, "x").min(0).max(30).name('x轴移动')

      // 用gsap动画库添加动画
      animate1 = Gsap.to(t.position, {y: 20, duration: 3, repeat: -1, yoyo: true, onComplete: () => {
        console.log('动画结束')
      }})
    }, undefined, (error) => {
      console.log(error)
    })

    // FbxLoader
    // const FbxLoader = new FBXLoader()
    // FbxLoader.load('./fbxFile.fbx', (file) =>{
    //   console.log(file)
    //   file.position.set(1,1,1)
    //   file.scale.set(.1,.1,.1)
    //   Gsap.to(file.rotation, {x: - Math.PI / 2, duration: 5})
    //   scene.add(file)
    // }, undefined, (err) =>{
    //   console.error(err)
    // })

    // 轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    renderer.setClearColor(webColorToHex('#999999'), 0.8)

    // 坐标体系
    const axesHelper = new Three.AxesHelper(30);
    scene.add(axesHelper)

    setThreeSetting({
      scene,
      camera,
      renderer
    })
    

    // time: 当前帧所在的 从0开始计时的 毫秒数
    const r = (time: number) => {
      if (t) {
        t.rotation.y += Math.PI * 0.001;
      }
      renderer.render(scene, camera)
      requestAnimationFrame(r)
      controls.update()

    }
    r(0)

    
  }, [])

  useEffect(() => {
    window.addEventListener('dblclick', () => {
      if (animate1) {
        if (animate1.isActive()) {
          animate1.pause()
        } else {
          animate1.play()
        }
      }
      threeSetting.renderer.domElement.requestFullscreen()

    })


  }, [])

  useEffect(() => {
    console.log(size)
    setSizeInfo({
      width: size?.width as any,
      height: size?.height as any
    })
    if (threeSetting.camera) {
      (threeSetting.camera as Three.PerspectiveCamera).aspect = (size?.width as any) / (size?.height as any);
      (threeSetting.camera as Three.PerspectiveCamera).updateProjectionMatrix()
    }
    if (threeSetting.renderer) {
      (threeSetting.renderer as  Three.WebGLRenderer).setSize(size?.width as number, size?.height as number);
      (threeSetting.renderer as  Three.WebGLRenderer).setPixelRatio(window.devicePixelRatio);
    }
  }, [size])
  return (
    <div style={{width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px`}} ref={parentEl}></div>
  )
}
