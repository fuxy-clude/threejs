import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import * as Dat from "dat.gui";
import { ColorGuiHelp } from "src/common/utils";
import {Button} from 'antd4'
/** 申明全局对象 */
var scene: any,
  camera: any,
  ambientLight: any,
  directionalLight: any,
  renderer: any;

var cube: any, sphere: any, cylinder: any, torus: any, points: any;
var timeOut: any;


let oribit: any = null;

/** 初始化 */
function init(container: any) {
  createScene();
  createCamera();
  createLight();
  createMesh();
  createRenderer(container);
  console.log(123)
}

/** 创建场景 */
function createScene() {
  // 1、创建场景
  scene = new THREE.Scene();
}

/** 创建相机 */
function createCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 100);
}

/** 创建灯光 */
function createLight() {
  // 环境光
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 柔和的白光
  scene.add(ambientLight);

  // 平行光
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.castShadow = true;
  directionalLight.position.set(0, 100, 10);
  scene.add(directionalLight);
}

/** 创建网格 */
function createMesh() {
  createCube();
  // createPlane()
}

/** 创建立方体 */
function createCube() {
  // //立方体
  const cube_geometry = new THREE.BoxGeometry(20, 20, 20, 10, 10, 10);
  const material = new THREE.MeshStandardMaterial({ color: "#409eff" });
  cube = new THREE.Mesh(cube_geometry, material);
  cube.position.set(-30, 0, 0);
  // scene.add(cube);

  // 球
  const sphereGeometry = new THREE.SphereGeometry(10);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: "#67c23a" });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(30, 0, 0);
  // scene.add(sphere)

  // 圆柱
  const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 20, 32, 20, false);
  const cylinderMaterial = new THREE.MeshBasicMaterial({
    color: "#f56c6c",
    side: THREE.DoubleSide,
  });
  cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 30, 0);
  // scene.add(cylinder);

  // 圆环
  const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 80);
  const torusMaterial = new THREE.MeshBasicMaterial({ color: "#e6a23c" });
  torus = new THREE.Mesh(torusGeometry, torusMaterial);
  torus.position.set(0, -30, 0);
  // scene.add(torus);

  // 粒子
  const pointsArr = torusGeometry.attributes.position.array;
  const pointsGeometry = new THREE.BufferGeometry();
  const texture = new THREE.TextureLoader().load(
    "https://cdn.tanzhijian.net/myBlog/textures/gradient2.png"
  );
  pointsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(pointsArr, 3)
  );
  const pointsMaterial = new THREE.PointsMaterial({
    size: 0.7,
    map: texture,
    alphaMap: texture,
    color: "#e6a23c",
    transparent: true,
  });
  points = new THREE.Points(pointsGeometry, pointsMaterial);
  points.position.set(0, -30, 0);
  scene.add(points);
}

/** 先爆炸成粒子满屏 */
function transformPoints(pointsMesh, targetMesh) {
  if (timeOut) {
    clearTimeout(timeOut);
  }
  // 源模型的顶点
  let originVertices = pointsMesh.geometry.attributes.position.array;
  // 目标模型的顶点
  let positions = new Float32Array(
    pointsMesh.geometry.attributes.position.count * 3
  );
  for (let i = 0; i < pointsMesh.geometry.attributes.position.count; i++) {
    positions[i * 3 + 0] = (Math.random() * 2 - 1) * 100;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 100;
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * 100;
  }

  // 遍历每一个粒子
  for (let i = 0; i < positions.length; i++) {
    // 粒子从原始位置到目标位置的平滑移动，完成时间2000ms
    new TWEEN.Tween({
      x: originVertices[i * 3 + 0],
      y: originVertices[i * 3 + 1],
      z: originVertices[i * 3 + 2],
      index: i,
    })
      .to(
        {
          x: positions[i * 3 + 0],
          y: positions[i * 3 + 1],
          z: positions[i * 3 + 2],
          index: i,
        },
        2000
      )
      .onUpdate((pos) => {
        // 思路灵感 https://stackoverflow.com/questions/36699389/verticesneedupdate-in-three-js
        pointsMesh.geometry.attributes.position.setXYZ(
          pos.index,
          pos.x,
          pos.y,
          pos.z
        );
        pointsMesh.geometry.attributes.position.needsUpdate = true;
      })
      // .delay(2000)
      // .yoyo(true)
      // .repeat(Infinity)
      // 开始动画
      .start();
  }
  timeOut = setTimeout(() => {
    transform(pointsMesh, targetMesh);
  }, 2000);
}

// 然后转换成下一个模型
function transform(pointsMesh, targetMesh) {
  let originCount = pointsMesh.geometry.attributes.position.count;
  let targetCount = targetMesh.geometry.attributes.position.count;
  // 源模型的顶点
  let originVertices = pointsMesh.geometry.attributes.position.array;
  // 目标模型的顶点
  let targetVertices = targetMesh.geometry.attributes.position.array;
  let colorArray = new Float32Array(targetVertices.length);

  // 源粒子数大于目标模型顶点数 需减少
  if (originVertices.length > targetVertices.length) {
    originVertices = originVertices.slice(0, targetVertices.length);
  }
  // 源粒子数小于目标模型顶点数 需补齐
  if (originVertices.length < targetVertices.length) {
    let temp = new Float32Array(targetVertices.length);

    for (let i = 0; i < originVertices.length; i++) {
      // originVertices.push(new THREE.Vector3())
      temp[i] = originVertices[i];
      colorArray[i] = targetMesh.material.color;
    }
    for (let i = originVertices.length - 1; i < targetVertices.length; i++) {
      // originVertices.push(new THREE.Vector3())
      temp[i] = 0;
      colorArray[i] = targetMesh.material.color;
    }
    originVertices = temp;
  }

  new TWEEN.Tween({
    x: pointsMesh.position.x,
    y: pointsMesh.position.y,
    z: pointsMesh.position.z,
    color: pointsMesh.material.color,
  })
    .to(
      {
        x: targetMesh.position.x,
        y: targetMesh.position.y,
        z: targetMesh.position.z,
        color: targetMesh.material.color,
      },
      2000
    )
    .onUpdate((pos) => {
      pointsMesh.position.copy(pos);
      pointsMesh.material.color.copy(pos.color);
    })
    .delay(100)
    // .yoyo(true)
    // .repeat(Infinity)
    .start(); // 开始动画

  // 遍历每一个粒子
  for (let i = 0; i < originCount; i++) {
    // 粒子从原始位置到目标位置的平滑移动，完成时间2000ms
    new TWEEN.Tween({
      x: originVertices[i * 3 + 0],
      y: originVertices[i * 3 + 1],
      z: originVertices[i * 3 + 2],
      index: i,
    })
      .to(
        {
          x: targetVertices[i * 3 + 0],
          y: targetVertices[i * 3 + 1],
          z: targetVertices[i * 3 + 2],
          index: i,
        },
        2000
      )
      .onUpdate((pos) => {
        // 思路灵感 https://stackoverflow.com/questions/36699389/verticesneedupdate-in-three-js
        pointsMesh.geometry.attributes.position.setXYZ(
          pos.index,
          pos.x,
          pos.y,
          pos.z
        );
        // pointsMesh.material.color = targetMesh.material.color
        pointsMesh.geometry.attributes.position.needsUpdate = true;
      })
      .delay(100)
      // .yoyo(true)
      // .repeat(Infinity)
      .start(); // 开始动画
  }
}

function transformCube() {
  TWEEN.removeAll();
  transformPoints(points, cube);
}
function transformCylinder() {
  TWEEN.removeAll();
  transformPoints(points, cylinder);
}
function transformSphere() {
  TWEEN.removeAll();
  transformPoints(points, sphere);
}
function transformTorus() {
  TWEEN.removeAll();
  transformPoints(points, torus);
}

/** 创建渲染器 */
function createRenderer(container: any) {
  //3、创建渲染器
  renderer = new THREE.WebGLRenderer({
    // antialias: true, //是否开启反锯齿，设置为true开启反锯齿。
    // alpha: true,//是否可以设置背景色透明。
    logarithmicDepthBuffer: true, //模型的重叠部位便不停的闪烁起来。这便是Z-Fighting问题，为解决这个问题，我们可以采用该种方法
  });
  renderer.shadowMap.enabled = true; // TODO 渲染器是否开启阴影计算
  renderer.setSize(window.innerWidth, window.innerHeight);
  //坐标辅助对象
  // var axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
  //创建轨道控制器
  var orbitControls = new OrbitControls(camera, renderer.domElement);
  //控制器的阻尼（惯性）效果
  orbitControls.enableDamping = true;

  // 将渲染器添加到页面中
  container.appendChild(renderer.domElement);
  // var clock = new THREE.Clock();
  function animtion() {
    // let time = clock.getElapsedTime();

    requestAnimationFrame(animtion);

    orbitControls.update();

    // 渲染场景和相机
    renderer.render(scene, camera);
    TWEEN.update();
  }

  animtion();
}

export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const parentEl = useRef<any>();
  useEffect(() => {
    init(parentEl.current);
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
    <div>
      <div
        style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px` }}
        ref={parentEl}
      ></div>
      <div className="buttons">
        <Button onClick={transformTorus} >圆环</Button>
        <Button onClick={transformCube} >立方体</Button>
        <Button onClick={transformCylinder} >圆柱体</Button>
        <Button onClick={transformSphere} >球体</Button>
    </div>
    </div>
  );
}
