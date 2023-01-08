/**
 * 自定义几何体
 * 1.使用BufferGeometry 自定义几何体
 */
import React, { useEffect, useRef, useState } from 'react'
import * as Three from 'three'
import * as Dat from 'dat.gui'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
let oribit:any = null;
let renderer: Three.WebGL1Renderer;
let sjxMesh: Three.Mesh
export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({width: window.innerWidth, height: window.innerHeight})
  const parentEl = useRef<any>()
  useEffect(() =>{
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight)

    for(let i=0;i<50;i++) {
      // 自定义几何体（四边形）
      const customGeometry = new Three.BufferGeometry();

      const points = new Float32Array(9)
      for(let j=0;j<9;j++) {
        points[j] = Math.random() * 4;
      }
      customGeometry.setAttribute('position', new Three.BufferAttribute(points, 3))
      const material = new Three.MeshBasicMaterial({color: new Three.Color(Math.random(), Math.random(), Math.random()),
      opacity: .5, transparent: true,})
      const mesh = new Three.Mesh(customGeometry, material);
      scene.add(mesh);
    }

    
    
    camera.lookAt(0,0,0);
    camera.position.set(10,0,10)

    const axesHelper = new Three.AxesHelper(5);
    renderer.setClearColor(0x666666, 0.8);

    oribit = new OrbitControls(camera, renderer.domElement)
    oribit.enableDamping = true;

    

    scene.add(axesHelper);

    parentEl.current.appendChild(renderer.domElement)

    const folder01 = new Dat.GUI().addFolder('控制器1')
    // folder01.add(mesh.position, 'y').min(0).max(30)


    const render = () =>{
      requestAnimationFrame(render);
      renderer.render(scene,camera);
      oribit.update()
    }

    render()
  }, [])


  useEffect(() =>{
    window.addEventListener('resize', () =>{
      setSizeInfo({
        width: window.innerWidth,
        height: window.innerHeight
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      
    })
  }, [])
  return (
    <div style={{width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px`}} ref={parentEl}></div>
  )
}
