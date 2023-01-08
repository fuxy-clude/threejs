import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import img from "./jiantou.jpeg";
import gsap from 'gsap'
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let scene: Three.Scene;
let camera: Three.Camera;
let isMove: boolean = false;
const pointer = new Three.Vector2();
const raycaster = new Three.Raycaster()
class Room {
    mesh: Three.Mesh
  constructor(
    name: string,
    roomIndex: number,
    position = new Three.Vector3(0, 0, 0),
    euler = new Three.Euler(0,0,0)
  ) {
    const textureUrls = [
      `${roomIndex}_l`,
      `${roomIndex}_r`,
      `${roomIndex}_u`,
      `${roomIndex}_d`,
      `${roomIndex}_b`,
      `${roomIndex}_f`,
    ]
    console.log(textureUrls)
    const materialArr: Three.MeshBasicMaterial[] = [];
    textureUrls.forEach((url) => {
      const w_url = require(`@/assets/house/${name}/${url}.jpg`)
      const currentTexture = new Three.TextureLoader().load(w_url);
      if (url === `${roomIndex}_u` || url === `${roomIndex}_d`) {
        currentTexture.rotation = Math.PI;
        currentTexture.center = new Three.Vector2(0.5, 0.5);
      }
      materialArr.push(new Three.MeshBasicMaterial({ map: currentTexture }));
    });
    const geometry = new Three.BoxGeometry(10, 10, 10);
    geometry.scale(1, 1, -1);
    const mesh = new Three.Mesh(geometry, materialArr);
    mesh.position.copy(position);
    mesh.rotation.copy(euler)
    this.mesh = mesh
    
    // mesh.copy(euler);
    scene.add(mesh);
  }
}

class Sprite {
    callbacks: any[] = []
    spriteCube: any
  constructor(
    name: string,
    position: any,
    getInScene: Three.Mesh
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const canvas2D: any = canvas.getContext("2d");
    canvas2D?.fillRect(0, 256, 1024, 500);
    canvas2D.fillStyle = "rgba(100, 100, 100, 0.7)";
    canvas2D.font = "bold 100px Arial";
    canvas2D.textAlign = "center";
    canvas2D.fillStyle = "white";
    canvas2D?.fillText(name, 512, 512);
    const textureCanvas = new Three.CanvasTexture(canvas);
    const spriteMaterial = new Three.SpriteMaterial({
      map: textureCanvas,
      transparent: true,
    });
    const spriteCube = new Three.Sprite(spriteMaterial);
    
    scene.add(spriteCube);
    spriteCube.position.copy(position);
    this.spriteCube = spriteCube;
    window.addEventListener("click", (event) =>{
        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(spriteCube);
        if (intersects.length > 0) {
            console.log(getInScene)
            
            this.callbacks.forEach(cb =>{
                cb()
            })
        }
    })
  }

  onClick(callback: any) {
    this.callbacks.push(callback);
  }
}

export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [loadingCount, setLoadingCount] = useState<string | number>(1)
  const parentEl = useRef<any>();
  useEffect(() => {
    scene = new Three.Scene();
    camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.add(new Three.AmbientLight(0xffffff, 1));
    camera.position.z = 0.1;
    camera.rotateY(0)
    /**
     * 1. 使用图片纹理
     */
    
    const livingMesh = new Room("living", 4, new Three.Vector3(0, 0, 0), new Three.Euler(0, Math.PI,0));
    const restoomMesh = new Room("restroom", 7, new Three.Vector3(-15, 0, 0), new Three.Euler(-Math.PI*.01, Math.PI/1.3,Math.PI/8.3));
    console.log(livingMesh.mesh)
    const test = {
        x: Math.PI/25,
        y: -Math.PI/5.26,
        z: Math.PI/14.28
    }
    const gui = new Dat.GUI()
    gui.add(test, 'x', -Math.PI, Math.PI, Math.PI/100).onChange(e =>{
        restoomMesh.mesh.rotation.x = e;
        restoomMesh.mesh.rotation.order = "YXZ";
    })
    gui.add(test, 'y', -Math.PI, Math.PI, Math.PI/100).onChange(e =>{
        restoomMesh.mesh.rotation.y = e;
        restoomMesh.mesh.rotation.order = "YXZ";
    })
    gui.add(test, 'z', -Math.PI, Math.PI, Math.PI/100).onChange(e =>{
        restoomMesh.mesh.rotation.z = e;
        restoomMesh.mesh.rotation.order = "YXZ";
    })
    // 创建精灵模型
    const restroomSprite = new Sprite("卫生间", new Three.Vector3(2.9, -2.3, 1.6), restoomMesh.mesh)
    const livingSprite = new Sprite("客厅", new Three.Vector3(-17,-0.1,2), livingMesh.mesh)
    restroomSprite.onClick(() =>{
      gsap.to(camera.position, {
          duration: .3,
          x: restoomMesh.mesh.position.x,
          y: restoomMesh.mesh.position.y,
          z: restoomMesh.mesh.position.z
      })
    })
    livingSprite.onClick(() =>{
      gsap.to(camera.position, {
          duration: .3,
          x: livingMesh.mesh.position.x,
          y: livingMesh.mesh.position.y,
          z: livingMesh.mesh.position.z
      })
    })
    
    const gui1 = new Dat.GUI()
    gui1.add(livingSprite.spriteCube.position, 'x', -20, 20, .1)
    gui1.add(livingSprite.spriteCube.position, 'y', -20, 20, .1)
    gui1.add(livingSprite.spriteCube.position, 'z', -20, 20, .1)


        // const oribit = new OrbitControls(camera, renderer.domElement)
        // oribit.enableDamping = true
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
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

    window.addEventListener("mousedown", () => {
      isMove = true;
    });
    window.addEventListener("mouseup", () => {
      isMove = false;
    });
    window.addEventListener("mouseout", () => {
      isMove = false;
    });
    window.addEventListener("mousemove", (e) => {
      if (isMove) {
        camera.rotation.y += e.movementX * 0.002;
        camera.rotation.x += e.movementY * 0.002;
        camera.rotation.order = "YXZ";
      }
    });

    Three.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      console.log(url, loaded, total, (Number(loaded/total)*100).toFixed(2))
      setLoadingCount((Number(loaded/total)*100).toFixed(2))

    }
  }, []);
  return (
    <>
      <div
        style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px`, display:+loadingCount === 100 ? 'block' : 'none' }}
        ref={parentEl}
      ></div>
      <progress value={+loadingCount} max={100} style={{display:+loadingCount === 100 ? 'none' : 'block', width: '30vw', height: '100px', position: 'absolute', top:'0',bottom:0,left:0,right:0,margin:'auto' }} />
      <img style={{ display:+loadingCount === 100 ? 'none' : 'block',  filter: `blur(${+loadingCount === 100? '100px' : 500/+loadingCount + 30}px)`, width:'100vw',height: '100vh'}} src="./house/living/4_b.jpg" alt="" />
    </>
    
  );
}
