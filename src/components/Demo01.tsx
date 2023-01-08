/**
 * 创建场景/集合体/物体/相机 相关基础设置
 */
import React, { useEffect, useRef, useState } from 'react'
import * as Three from 'three'
import {useSize} from 'ahooks'

export default function Demo01() {
  const parentEl = useRef<any>(null)
  const size = useSize(window.document.body)
  const [sizeInfo, setSizeInfo] = useState({width: window.innerWidth, height: window.innerHeight})
  console.log(sizeInfo)

  useEffect(() => {
    // 创建场景
    const scene = new Three.Scene();
    // 创建摄像头
    console.log(parentEl?.current?.clientWidth)
    const camera = new Three.PerspectiveCamera(75, parentEl?.current?.clientWidth / parentEl?.current?.clientHeight, 0.1, 1000)
    
    const renderer = new Three.WebGLRenderer();

    renderer.setSize(parentEl?.current?.clientWidth, parentEl?.current?.clientHeight)

    parentEl?.current?.appendChild(renderer.domElement);

    // 01: 画一个矩形
// // 创建物体
    const geometry = new Three.BoxGeometry(1,1,1)
// // 创建材质
    const material = new Three.MeshBasicMaterial({ color: 0x00ff00});
    const material1 = new Three.MeshBasicMaterial({ color: 'blue'});

//     // 创建网格
    const cube = new Three.Mesh(geometry, [material, material1, material1, material1 ,material1,material1])
    
    scene.add(cube)
    /***
     * 
     * Vector3: 矢量图形
     */
    // 02: 画一个线条
    // 线条是画在每一个连续顶点之间的线段，所以要创建所有的点
    camera.position.set(0,0,100);
    camera.lookAt(0,0,0)
    let points = [];
    points = [new Three.Vector3(-20, 5, 0), new Three.Vector3(0, 10, 0), new Three.Vector3(20, 0, 0)]
    const material2 = new Three.LineDashedMaterial({color: 'blue'});

    const geometry1 = new Three.BufferGeometry().setFromPoints(points);
    const line = new Three.Line(geometry1, material2)
    scene.add(line)

    /**
     * 03: 文字
     */
    

    const r = () => {
      requestAnimationFrame(r)
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera)
    }
    r()

    
  }, [])

  useEffect(() => {
    console.log(size)
    setSizeInfo({
      width: size?.width as any,
      height: size?.height as any
    })
  }, [size])
  return (
    <div style={{width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px`}} ref={parentEl}></div>
  )
}
