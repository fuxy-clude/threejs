import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import * as CANNON from "cannon-es";
import { ContactEquation } from "cannon-es";
import hitMp3 from "@/assets/audio/hit.mp3"
console.log(hitMp3)
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
    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -5, 0);
    plane.rotation.x = -Math.PI * 0.5;
    plane.receiveShadow = true;
    scene.add(plane);
    const pointLightColor = 0xffffff;
    const intensityPoint = 0.5;
    const pointLight = new Three.DirectionalLight(
      pointLightColor,
      intensityPoint
    );
    pointLight.position.set(0, 5, 0);
    pointLight.castShadow = true;
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
    const pointHelp = new Three.DirectionalLightHelper(pointLight);
    scene.add(pointHelp);
    scene.add(pointLight);

    const allBox:any = [];
    const p_matrial = new CANNON.Material();
    const p_planeMaterial = new CANNON.Material({});
    const physicWorld = new CANNON.World();
    physicWorld.gravity.set(0, -9.8, 0);

    function addBox() {
      const sphereGeomery = new Three.BoxGeometry(1, 1, 1, 50, 50);
      const sphereMesh = new Three.Mesh(
        sphereGeomery,
        new Three.MeshStandardMaterial({
          color: new Three.Color(Math.random(), Math.random(), Math.random())
          // color: new Three.Color({
          //   r: Math.random(),
          //   g: Math.random(),
          //   b: Math.random()
          // })
        })
      );
      sphereMesh.castShadow = true;
      sphereMesh.position.set(0, 5, 0);
      scene.add(sphereMesh);

      
      const p_sphereShape = new CANNON.Box(new CANNON.Vec3(.5,.5,.5))
      const p_sphereBody = new CANNON.Body({
        shape: p_sphereShape,
        position: new CANNON.Vec3(0, 5, 0),
        mass: 1,
        material: p_matrial,
      });
      p_sphereBody.applyLocalForce(
        new CANNON.Vec3(300, 0, 300), //添加的力的大小和方向
        new CANNON.Vec3(0, 0, 0) //施加的力所在的位置
      );
      

      // 碰撞检测、音效
    const audio = new Audio(hitMp3);
    let firstVolume: number = 1;
    const hitCallBack = (e: any) => {
      console.log(
        (e.contact as ContactEquation).getImpactVelocityAlongNormal()
      );
      const impact = (
        e.contact as ContactEquation
      ).getImpactVelocityAlongNormal();
      firstVolume = Math.max(impact, firstVolume);
      console.log(impact / firstVolume);
      audio.volume = impact< 0 ? .2 :impact / firstVolume;
      audio.currentTime = 0;
      audio.play();
    };
    p_sphereBody.addEventListener("collide", hitCallBack);

      physicWorld.addBody(p_sphereBody);
      allBox.push({
        mesh: sphereMesh,
        p_mesh: p_sphereBody
      })
    }

    const p_planeShape = new CANNON.Plane();
      const p_planeBody = new CANNON.Body({
        shape: p_planeShape,
        position: new CANNON.Vec3(0, -5, 0),
        material: p_planeMaterial,
        mass: 0,
      });
      p_planeBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
      );
      physicWorld.addBody(p_planeBody);


    

    window.addEventListener('click', addBox)

    /**
     * 物理世界
     */

    

    // 设置材质之间的联系
    const materialContact = new CANNON.ContactMaterial(
      p_matrial,
      p_planeMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      }
    );
    physicWorld.addContactMaterial(materialContact);
    physicWorld.defaultContactMaterial = materialContact;

    /**
     * 物理世界
     */
    scene.add(new Three.AmbientLight(0xffffff, 1));
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0, 18);
    const axesHelper = new Three.AxesHelper(30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    renderer.shadowMap.enabled = true;
    parentEl.current.appendChild(renderer.domElement);
    const clock = new Three.Clock();
    const render = () => {
      const time = clock.getDelta();
      allBox.forEach((item: any) =>{
        item.mesh.position.copy(item.p_mesh.position as any);
        item.mesh.quaternion.copy(item.p_mesh.quaternion as any);
      })
      
      physicWorld.step(1 / 120, time);
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
