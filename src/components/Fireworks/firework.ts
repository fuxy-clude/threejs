import * as Three from 'three';
import startPointVertexShader from './shader/startPoint/vertexShader.glsl'
import startPointFragmentShader from './shader/startPoint/fragmentShader.glsl'
import fireworkVertexShader from './shader/firework/vertexShader.glsl'
import fireworkFragmentShader from './shader/firework/fragmentShader.glsl'
interface Position {
    x: number;
    y: number;
    z: number;
}

interface Params {
    from?: Position;
    to: Position;
    color: string
}

export class FireWork {
    startPoint: Three.Points;
    startPointMaterial: Three.ShaderMaterial;
    fireworkMaterial: Three.ShaderMaterial;
    clock: Three.Clock;
    fireWorks: Three.Points;
    startPointGeometry: Three.BufferGeometry;
    fireworkGeometry: Three.BufferGeometry;
    scene: Three.Scene;
    color: Three.Color;

    // 声音
    biuAudio: Three.Audio;
    biuPlaying: boolean = false;
    bomAudio: Three.Audio;
    bomPlaying: boolean = false;
    constructor(params: Params) {
        const {
            from = {
                x:0,
                y:0,
                z:0
            },
            to,
            color
        } = params;
        this.color = new Three.Color(color);
        console.log('创建烟花',color,this.color)

        // 创建开始的烟花（点）
        this.startPointGeometry = new Three.BufferGeometry();
        this.startPointGeometry.setAttribute(
            'position',
            new Three.BufferAttribute(new Float32Array([from.x, from.y, from.z]), 3)
        )
        this.startPointGeometry.setAttribute(
            'uTargetVec',
            new Three.BufferAttribute(new Float32Array([to.x-from.x, to.y-from.y, to.z-from.z]), 3)
        )
        this.startPointMaterial = new Three.ShaderMaterial({
            side: Three.DoubleSide,
            transparent: true,
            blending: Three.AdditiveBlending,
            depthWrite: false,
            vertexShader: startPointVertexShader,
            fragmentShader: startPointFragmentShader,
            uniforms: {
                uTime: {
                    value: 0,
                },
                uSize: {
                    value: 20,
                },
                uColor: {
                    value: this.color
                }
            }
        })
        this.startPoint = new Three.Points(this.startPointGeometry, this.startPointMaterial);

        this.clock = new Three.Clock();
        // 创建爆炸的烟花1
        this.fireworkGeometry = new Three.BufferGeometry();
        const counts = 180;
        const fireworkPoints = new Float32Array(counts * 3);
        const fireworkPointsPositions = new Float32Array(counts * 3);
        for(let i=0;i<counts;i++) {
            fireworkPointsPositions[i * 3 + 0] = to.x * 3;
            fireworkPointsPositions[i * 3 + 1] = to.y * 3;
            fireworkPointsPositions[i * 3 + 2] = to.z * 3;

            const horizontalAngel = Math.PI * 2 * Math.random();
            const verticalAngel = Math.PI * 2 * Math.random();
            const r = Math.random();
            fireworkPoints[i * 3 + 0] = r * Math.sin(horizontalAngel) + r * Math.sin(verticalAngel)
            fireworkPoints[i * 3 + 1] = r * Math.cos(horizontalAngel) + r * Math.cos(verticalAngel)
            fireworkPoints[i * 3 + 2] = r * Math.sin(horizontalAngel) + r * Math.cos(verticalAngel)
        }
        this.fireworkGeometry.setAttribute(
            'position',
            new Three.BufferAttribute(fireworkPointsPositions, 3)
        )
        this.fireworkGeometry.setAttribute(
            'randomSize',
            new Three.BufferAttribute(fireworkPoints, 3)
        )
        this.fireworkMaterial = new Three.ShaderMaterial({
            side: Three.DoubleSide,
            transparent: true,
            blending: Three.AdditiveBlending,
            depthWrite: false,
            vertexShader: fireworkVertexShader,
            fragmentShader: fireworkFragmentShader,
            uniforms: {
                uTime: {
                    value: 0,
                },
                uSize: {
                    value: 0,
                },
                uColor: {
                    value: this.color
                }
            }

        })
        this.fireWorks = new Three.Points(this.fireworkGeometry, this.fireworkMaterial);

        // 创建声音
        const biuListener = new Three.AudioListener();
        this.biuAudio = new Three.Audio(biuListener);
        const bomListener = new Three.AudioListener();
        this.bomAudio = new Three.Audio(bomListener);
        const audioLoader = new Three.AudioLoader();
        audioLoader.load(require('./assets/audio/send.mp3'), buffer =>{
            this.biuAudio.setBuffer(buffer);
            this.biuAudio.setLoop(false);
            this.biuAudio.setVolume(1);
        })
        // 
        audioLoader.load(require(`./assets/audio/pow${Math.floor(Math.random() * 4) + 1}.ogg`), buffer =>{
            this.bomAudio.setBuffer(buffer);
            this.bomAudio.setLoop(false);
            this.bomAudio.setVolume(1);
        })

    }

    addScene(scene: Three.Scene) {
        scene.add(this.startPoint)
        scene.add(this.fireWorks);
        this.scene = scene;
    }

    update() {
        if (this.clock.getElapsedTime() < 1) {
            this.startPointMaterial.uniforms.uTime.value = this.clock.getElapsedTime();
            if (this.clock.getElapsedTime() > 0.2 && !this.biuPlaying && !this.biuAudio.isPlaying) {
                this.biuAudio.play();
                this.biuPlaying = true;
            }
        } else {
            if (!this.bomPlaying && !this.bomAudio.isPlaying) {
                this.bomAudio.play();
                this.bomPlaying = true;
            }
            this.startPointMaterial.uniforms.uSize.value = 0;
            this.fireworkMaterial.uniforms.uSize.value = 2;
            const newTime = this.clock.getElapsedTime() - 1;
            this.fireworkMaterial.uniforms.uTime.value = newTime;
            if(this.clock.getElapsedTime() > 2) {
                this.fireworkMaterial.uniforms.uSize.value = 0;
                this.startPoint.clear();
                this.startPointMaterial.dispose();
                this.startPointGeometry.dispose()
                this.fireworkGeometry.dispose();
                this.fireworkMaterial.dispose();
                this.fireWorks.clear();
                this.scene.remove(this.fireWorks);
                this.scene.remove(this.startPoint);
                return "clear"
            }
        }
    }


}