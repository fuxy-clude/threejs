import * as Three from "three";
import gsap from 'gsap';
export const editCityShader = (mesh: THREE.Mesh) => {
  (mesh.material as THREE.MeshBasicMaterial).onBeforeCompile = (
    shader: THREE.Shader
  ) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `
        #include <dithering_fragment>
        //#end#
    `
    );
    addGradColor(shader, mesh);
    addSpread(shader, mesh);
    addLightLine(shader,mesh)
    addLightLineY(shader,mesh)
  };
};

export function addGradColor(shader: Three.Shader, mesh: Three.Mesh) {
  mesh.geometry.computeBoundingBox();
  const { min, max } = mesh.geometry.boundingBox;
  const heightDiff = max.y - min.y;
  shader.uniforms.uHeightDiff = {
    value: heightDiff
  }
  shader.uniforms.uMinY = {
    value: min.y
  }
  shader.uniforms.uTopColor = {
    value: new Three.Color('#aaaeff')
  }

  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `  
            #include <common>
            uniform float uHeightDiff;
            uniform vec3 uTopColor;
            varying vec3 vPosition;
            varying vec2 vUv;
            `
  );
  
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `  
    #include <begin_vertex>
    vPosition = position;
    vUv = uv;
            `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `  
            #include <common>
            uniform float uHeightDiff;
            uniform vec3 uTopColor;
            varying vec3 vPosition;
            uniform float uMinY;
            varying vec2 vUv;
            uniform float uTime;
            uniform float uLightTime;
            uniform float uLightYTime;
            `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "//#end#",
    `  
        vec4 distGradColor = gl_FragColor;
        float percent = (vPosition.y - uMinY)/uHeightDiff;
        vec3 mixColor = mix(distGradColor.xyz, uTopColor,percent);
            gl_FragColor = vec4(mixColor, 1);
            //#end#
            `
  );
}

export function addSpread(shader: Three.Shader, mesh: Three.Mesh) {
  shader.uniforms.uTime = {
    value: 0
  }
  shader.fragmentShader = shader.fragmentShader.replace(
    "//#end#",
    `  
      float radius = distance(vec2(0,0), vPosition.xz);
      float lightY = -(radius-uTime)*(radius-uTime) + 20.0;
      if (lightY > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(1,1,1,0.6), lightY/20.0);
      }
      //#end#
            `
  );

  gsap.to(shader.uniforms.uTime, {
    value: 600,
    repeat: -1,
    duration: 2,
    ease: 'none',
    yoyo: true,
  })

}
export function addLightLine(shader: Three.Shader, mesh: Three.Mesh) {
  shader.uniforms.uLightTime = {
    value: -600
  }
  shader.fragmentShader = shader.fragmentShader.replace(
    "//#end#",
    `  
      float lightLine = -(vPosition.x/2.0-uLightTime)*(vPosition.x/2.0-uLightTime) + 10.0;
      if (lightLine > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(0.8,1,1,0.6), lightLine/10.0);
      }
      //#end#
            `
  );

  gsap.to(shader.uniforms.uLightTime, {
    value: 600,
    repeat: -1,
    duration: 4,
    ease: 'none',
  })

}
export function addLightLineY(shader: Three.Shader, mesh: Three.Mesh) {
  shader.uniforms.uLightYTime = {
    value: 200
  }
  shader.fragmentShader = shader.fragmentShader.replace(
    "//#end#",
    `  
      float lightLineY = -(vPosition.y/2.0-uLightYTime)*(vPosition.y/2.0-uLightYTime) + 10.0;
      if (lightLineY > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(1,1,1,0.3), lightLineY/10.0);
      }
      //#end#
            `
  );

  gsap.to(shader.uniforms.uLightYTime, {
    value: -200,
    repeat: -1,
    duration: 4,
    ease: 'none',
  })

}