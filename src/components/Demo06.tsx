import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
const obj = {
  1: '环境光',
  2: '半球光',
  3: '方向光源',
  4: '点光源',
  5: '聚光灯'
}
let oribit: any = null;
let renderer: Three.WebGL1Renderer;
let name:string = ''



class GuiHelp {
  object: any;
  prop: any;
  constructor(object: any, prop: any) {
    this.object = object;
    this.prop = prop;
  }

  get value() {
    return this.object[this.prop];
  }
  set value(hexString) {
    this.object[this.prop] = hexString
  }
}

const controls = {
  currentGui: 4
}

export default function Demo06() {
  const [sizeInfo, setSizeInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const parentEl = useRef<any>();
  useEffect(() => {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    renderer = new Three.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 创建一个球 / 正方体 / 平面;
    // 1.创建平面纹理
    const planeSize = 40;
    const loader = new Three.TextureLoader();
    const texture = loader.load(require('@/assets/plane.png'));
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.magFilter = Three.NearestFilter;
    texture.repeat.set(planeSize / 2, planeSize / 2);

    // 平面几何体
    const planeGeometry = new Three.PlaneGeometry(planeSize, planeSize)
    // 平面材质
    const planeMaterial = new Three.MeshPhongMaterial({
      map: texture,
      side: Three.DoubleSide,
    })
    // 创建平面
    const plane = new Three.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI * .5

    scene.add(plane)

    // 坐标系
    const asHelp = new Three.AxesHelper(planeSize)
    scene.add(asHelp)

    // 立方体
    const cubeSize = 4;
    const cubeGeometry = new Three.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMaterial = new Three.MeshPhongMaterial({color: '#8AC'});
    const cube = new Three.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize+1,cubeSize/2,0);
    scene.add(cube)

    //球
    const sphereRadius = 3;
    const sphereWidth = 32;
    const sphereHeight = 16;
    const sphereGeomery = new Three.SphereGeometry(sphereRadius, sphereWidth, sphereHeight);
    const sphereMatrial = new Three.MeshPhongMaterial({color: '#CA8'});
    const sphereMesh = new Three.Mesh(sphereGeomery, sphereMatrial);

    sphereMesh.position.set(-sphereRadius-1, sphereRadius+2, 0);

    scene.add(sphereMesh)

    /**
     * 光源: 1.环境光
     * 注：环境光没有方向，在环境光中的物体，呈现的颜色为  环境光颜色 * 物体颜色 * 环境光强度 所得到的颜色
     */
    const lightColor = 0xFFFFFF;
    const intensity = 1;
    const ambientLight = new Three.AmbientLight(lightColor, intensity);
    // scene.add(ambientLight);

    const gui = new Dat.GUI();
    gui.addColor(new ColorGuiHelp(ambientLight, 'color'), 'value').name('环境光颜色');
    gui.add(ambientLight, 'intensity', 0, 2, 0.01).name('环境光强度');

    /**
     * 光源2： 半球光
     * 注：半球光为从天空到地面两个颜色的渐变，一个点受到的光照颜色为：所在平面的朝向所决定，朝向天空，受到天空的光照颜色，
     * 朝向地下，受到地下光照颜色，其他角度为两个颜色渐变色。
     */
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity1 = 1;
    const hemiSphereLight = new Three.HemisphereLight(skyColor, groundColor, intensity1);
    const guiHemi = new Dat.GUI();
    guiHemi.addColor(new ColorGuiHelp(hemiSphereLight, 'color'), 'value').name('半球光天空颜色');
    guiHemi.addColor(new ColorGuiHelp(hemiSphereLight, 'groundColor'), 'value').name('半球光土地颜色');
    guiHemi.add(hemiSphereLight, 'intensity', 0, 2, 0.01).name('半球光强度')
    // scene.add(hemiSphereLight);

    /**
     * 光源3： 方向光
     * 模拟太阳光照效果
     */
    const directionLightColor = 0xFFFFFF;
    const intensityDir = 1;
    const dirLight = new Three.DirectionalLight(directionLightColor, intensityDir);
    dirLight.position.set(0, 10, 0)
    dirLight.target.position.set(-5, 0, 0)
    // scene.add(dirLight)
    // scene.add(dirLight.target)
    const dirGui = new Dat.GUI();
    dirGui.addColor(new ColorGuiHelp(dirLight, 'color'), 'value').name('方向光color');
    dirGui.add(dirLight.position, 'x', -10, 10);
    dirGui.add(dirLight.position, 'y', -10, 10);
    dirGui.add(dirLight.position, 'z', -10, 10);
    const dirHelp = new Three.DirectionalLightHelper(dirLight);
    // scene.add(dirHelp)


    /**
     * 光源4：点光
     * 从一个点散发出来的光源
     */
    const pointLightColor = 0xFFFFFF;
    const intensityPoint = 1;
    const pointLight = new Three.PointLight(pointLightColor, intensityPoint);
    pointLight.position.set(15, 20, -15)
    const pointGui = new Dat.GUI();
    pointGui.addColor(new ColorGuiHelp(pointLight, 'color'), 'value').name('点光源color')
    pointGui.add(pointLight.position, 'x').name('点光源x').min(-planeSize).max(planeSize)
    pointGui.add(pointLight.position, 'y').name('点光源y').min(0).max(planeSize)
    pointGui.add(pointLight.position, 'z').name('点光源z').min(-planeSize).max(planeSize)
    pointGui.add(pointLight, 'intensity', 0, 2, 0.01).name('强度')
    const pointHelp = new Three.PointLightHelper(pointLight)
    scene.add(pointHelp)
    scene.add(pointLight);

    /**
     * 光源5： 聚光灯
     * 一个点光源被 两个圆锥体限制光照范围的光线
     */
    const spotColor = 0xFFFFFF;
    const intensitySpot = 1;
    const spotLight = new Three.SpotLight(spotColor, intensitySpot);
    spotLight.position.set(12, 20, -15) 
    // scene.add(spotLight);
    // scene.add(spotLight.target);
    const spotHelp = new Three.SpotLightHelper(spotLight);

    const spotGui = new Dat.GUI();
    spotGui.add(spotLight, 'angle', 0, Math.PI/2, Math.PI / 100)
    // scene.add(spotHelp);

    const init = () =>{
      gui.hide();
      guiHemi.hide();
      dirGui.hide();
      spotGui.hide();

      scene.remove(ambientLight)

      scene.remove(hemiSphereLight)

      scene.remove(dirLight)
      scene.remove(dirLight.target)
      scene.remove(dirHelp)

      

      scene.remove(spotLight);
      scene.remove(spotLight.target);
      scene.remove(spotHelp);
    }


    const mainGui = new Dat.GUI()
    mainGui.add(controls, 'currentGui', 1, 5, 1).onChange(val =>{
      console.log(val)
      init()
      scene.remove(pointHelp)
      scene.remove(pointLight);
      pointGui.hide();
      switch(val) {
        case 1: {
          gui.show();
          scene.add(ambientLight)
          break;
        }
        case 2: {
          guiHemi.show();
          scene.add(hemiSphereLight)
          break;
        }
        case 3: {
          dirGui.show();
          scene.add(dirLight)
          scene.add(dirLight.target)
          scene.add(dirHelp)
          break;
        }
        case 4: {
          pointGui.show();
          scene.add(pointHelp)
          scene.add(pointLight)
          break;
        }
        case 5: {
          spotGui.show();
          scene.add(spotLight);
          scene.add(spotLight.target);
          scene.add(spotHelp);
          break;
        }
      }
    }).name('GUI控制器')

    init()

    // 常规代码
    camera.position.set(0, 15, 30);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    parentEl.current.appendChild(renderer.domElement);
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
    <div
      style={{ width: `${sizeInfo.width}px`, height: `${sizeInfo.height}px` }}
      ref={parentEl}
    ></div>
  );
}
