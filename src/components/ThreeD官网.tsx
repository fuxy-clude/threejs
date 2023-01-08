import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import gsap from 'gsap'
let oribit: any = null;
let renderer: Three.WebGLRenderer;
const pointer = new Three.Vector2();
const raycaster = new Three.Raycaster();
let page0Mesh: Three.Group;
let camera: Three.Camera;
export default function Demo03() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const scene = new Three.Scene();
    camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    renderer = new Three.WebGL1Renderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const pointLightColor = 0xffffff;
    const intensityPoint = 1;
    const pointLight = new Three.PointLight(pointLightColor, intensityPoint);
    pointLight.position.set(15, 20, -15);

    scene.add(new Three.AmbientLight(0xffffff, 1));
    const geometry = new Three.BoxBufferGeometry(2, 2, 2);
    const baseMetrial = new Three.MeshBasicMaterial({ wireframe: true });
    const redMatrial = new Three.MeshBasicMaterial({ color: 0xfff000 });

    page0Mesh = new Three.Group();
    const boxArr: Three.Object3D[] = [];
    for (let x = -3; x < 3; x++) {
      for (let y = -3; y < 3; y++) {
        for (let z = -3; z < 3; z++) {
          const mesh = new Three.Mesh(geometry, baseMetrial);
          mesh.position.set(x, y, z);
          page0Mesh.add(mesh);
          boxArr.push(mesh);
        }
      }
    }
    console.log(page0Mesh);
    window.addEventListener("click", (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(boxArr);
      intersects.forEach((item) => {
        (item.object as Three.Mesh).material = redMatrial;
      });
    });
    scene.add(page0Mesh);
    page0Mesh.rotation.order = "YXZ"
    gsap.to(page0Mesh.rotation, {
      x: '+='+Math.PI*2,
      y: '+='+Math.PI*2,
      z: '+='+Math.PI*2,
      duration: 5,
      repeat: -1
    })

    let x = 0;
    window.addEventListener("mousemove", (e) => {
      console.log(Math.sin((e.clientX / window.innerWidth) * Math.PI));
      let i = (e.clientX / window.innerWidth) - .5
      console.log(camera.position, i);
      camera.position.x += (i * 10) - camera.position.x
    });

    // 三角形
    const sjxGroup = new Three.Group();
    for (let i = 0; i < 50; i++) {
      // 自定义几何体（四边形）
      const customGeometry = new Three.BufferGeometry();

      const points = new Float32Array(9);
      for (let j = 0; j < 9; j++) {
        points[j] = Math.random() * 4 + 8;
      }
      customGeometry.setAttribute(
        "position",
        new Three.BufferAttribute(points, 3)
      );
      const material = new Three.MeshBasicMaterial({
        color: new Three.Color(Math.random(), Math.random(), Math.random()),
        opacity: 0.5,
        transparent: true,
        side: Three.DoubleSide,
      });
      const sjxMesh = new Three.Mesh(customGeometry, material);

      console.log(sjxMesh);
      sjxGroup.add(sjxMesh);
    }
    sjxGroup.position.set(-10, -37.5, 0);
    console.log(sjxGroup);
    scene.add(sjxGroup);

    // 旋转小球
    // 1.创建平面纹理
    const sphereGroup = new Three.Group();
    const planeSize = 80;
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
    plane.rotation.x = Math.PI * 0.5;

    const sphereGeomery = new Three.SphereGeometry(5);
    const sphere0 = new Three.Mesh(
      sphereGeomery,
      new Three.MeshPhongMaterial({ color: "#fff000" })
    );
    sphere0.castShadow = true;
    sphere0.position.set(0, 5, 0);
    sphereGroup.add(sphere0);

    plane.receiveShadow = true;
    sphereGroup.add(plane);

    const sphereMesh = new Three.Mesh(
      new Three.SphereGeometry(1),
      new Three.MeshPhongMaterial({color: 0xff0000})
  )
    sphereMesh.position.set(-15,12,-12)
    const pointLight1 = new Three.PointLight(0xff0000, 2, 100);
    pointLight1.castShadow = true;
    pointLight1.position.set(-15,12,-12)
    pointLight1.shadow.radius = 20;
    pointLight1.shadow.mapSize.set(1000, 1000)
    

    sphereMesh.castShadow = true;
    sphereMesh.add(pointLight1)
    console.log(sphereMesh)
    sphereGroup.add(sphereMesh);
    
    renderer.shadowMap.enabled = true;
    sphereGroup.position.set(0, -74, -35);
    scene.add(sphereGroup)
    // 旋转小球end
    const allGroup: Three.Group[] = [page0Mesh, sjxGroup, sphereGroup];

    let currentPage = 0;
    window.addEventListener("scroll", (ev) => {
      console.log(Math.round(window.scrollY / window.innerHeight));
      const newPage = Math.round(window.scrollY / window.innerHeight);
      if (currentPage !== newPage) {
        currentPage = newPage;
        gsap.to(allGroup[newPage].rotation, {
          x: '+='+Math.PI,
          y: '+='+Math.PI,
          z: '+='+Math.PI,
          duration: 1
        })
      }

      // camera.position.set(15,20 * (window.scrollY / window.innerHeight +),-15)
    });

    const pointHelp = new Three.PointLightHelper(pointLight);
    scene.add(pointHelp);
    // scene.add(pointLight);
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0, 19);
    new Dat.GUI().add(camera.position, "x", -30, 30, 0.1);
    new Dat.GUI().add(camera.position, "y", -30, 30, 0.1);
    new Dat.GUI().add(camera.position, "z", -30, 30, 0.1);
    const axesHelper = new Three.AxesHelper(10);
    renderer.setClearColor(0x999, 0.8);
    // oribit = new OrbitControls(camera, renderer.domElement);
    // oribit.enableDamping = true;
    scene.add(axesHelper);
    document.body.appendChild(renderer.domElement);
    const clock = new Three.Clock()
    const render = () => {
      requestAnimationFrame(render);
      const time = clock.getElapsedTime()
      sphereMesh.position.x = Math.sin(time) * 13
      pointLight1.position.x = Math.sin(time) * 13
      sphereMesh.position.z = Math.cos(time) * 13
      pointLight1.position.z = Math.cos(time) * 13
      camera.position.y = -((window.scrollY / window.innerHeight) * 30);
      renderer.render(scene, camera);
      // oribit.update();
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
    <div style={{ overflow: "auto" }}>
      <div className="page page0">
        <h1>付肖洋-Ray投射光线</h1>
        <h3>THREE.Raycaster实现3d交互效果</h3>
      </div>
      <div className="page page1">
        <h1>THREE.BufferGeometry！</h1>
        <h3>应用打造酷炫的三角形</h3>
      </div>
      <div className="page page2">
        <h1>活泼点光源</h1>
        <h3>点光源围绕照亮小球</h3>
      </div>
    </div>
  );
}
