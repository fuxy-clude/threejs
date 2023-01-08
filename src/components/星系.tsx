import React, { useEffect, useRef, useState } from "react";
import * as Three from "three";
import * as Dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ColorGuiHelp } from "src/common/utils";
import { Clock } from "three";
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

    const params = {
      count: 5000,
      color: 0xff6030,
      size: 0.8,
      branch: 8,
      radius: 15,
      rotateScale: 0.1,
      endColor: 0x1b3986
    };
    let points: Three.Points = new Three.Points();
    let material = null;
    let positions: any = new Float32Array(params.count * 3);
    let colors: any = new Float32Array(params.count * 3);
    const centerColor = new Three.Color(params.color)
    const endColor = new Three.Color(params.endColor);
    const generation = () => {
      for (let i = 0; i < params.count; i++) {
        //   当前的点应该在哪一条分支的角度上
        const branchAngel =
          (i % params.branch) * ((2 * Math.PI) / params.branch);

        // 当前点距离圆心的距离
        const distance =
          params.radius * Math.pow(Math.random(), 3) * Math.random();
        const current = i * 3;

        const random =
          (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;

        positions[current] =
          Math.cos(branchAngel + distance * params.rotateScale) * distance +
          random;
        positions[current + 1] = 0 + random;
        positions[current + 2] =
          Math.sin(branchAngel + distance * params.rotateScale) * distance +
          random;

        const mixColor = centerColor.clone();
        mixColor.lerp(endColor, distance / params.radius);
        colors[current] = mixColor.r;
        colors[current+1] = mixColor.g;
        colors[current+2] = mixColor.b;
      }
      let geometry = new Three.BufferGeometry();
      geometry.setAttribute(
        "position",
        new Three.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "color",
        new Three.BufferAttribute(colors, 3)
      );
      material = new Three.PointsMaterial({
        map: new Three.TextureLoader().load(require("@/assets/1.png")),
        alphaMap: new Three.TextureLoader().load(require("@/assets/1.png")),
        size: params.size,
        color: new Three.Color(params.color),
        blending: Three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        vertexColors: true,
      });
      points = new Three.Points(geometry, material);
      scene.add(points);
      return points;
    };
    generation();

    camera.position.set(0, 0, 10);
    const axesHelper = new Three.AxesHelper(10);
    renderer.setClearColor(0x666666, 0.8);
    oribit = new OrbitControls(camera, renderer.domElement);
    oribit.enableDamping = true;
    scene.add(axesHelper);
    parentEl.current.appendChild(renderer.domElement);
    const block = new Clock();
    const render = () => {
      const time = block.getDelta();
      // params.count
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
