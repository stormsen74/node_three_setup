/**
 * Created by STORMSEN on 01.12.2016.
 */

// var THREE = require('three');
import * as THREE from 'three';
import {Vector2} from "../math/vector2";

import SceneCameraController from "./SceneController";

// CameraControls.install({THREE: THREE});

var gsap = require('gsap');

var ColladaLoader = require('../three/loader/colladaLoader');

var glslify = require('glslify');

class SceneSetupBase {

    constructor() {

        console.log('1!')


        this.textureLoader = new THREE.TextureLoader();

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock();
        this.delta = 0;
        this.elapsed = 0;

        this.SETTINGS = {
            tlProgress: 0.0,
            tlSpeed: 0,
            boundingBox: true,
            METHODS: {
                togglePlay: function () {
                },
                fadeIn: function () {
                },
                playBlocks: function () {
                },
                reverseBlocks: function () {
                },
                startHover: function () {
                },
                stopHover: function () {
                }
            },
        };

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 1.7;
        this.camera.position.z = 6;

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            stencil: false
        });
        this.renderer.setClearColor(0xc3c3c3, .5);

        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);


        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enableDamping = true;
        // this.controls.dampingFactor = 0.25;
        // this.controls.enableZoom = true;


        this.sceneCameraController = new SceneCameraController(this.camera, this.renderer.domElement);
        // this.sceneCameraController.doSome();


        let size = 100;
        let divisions = 10;

        let gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);


        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: glslify('../shader/glslify/matcap_vert.glsl'),
            fragmentShader: glslify('../shader/glslify/matcap_frag.glsl'),
            uniforms: {
                iChannel2: {type: 't', value: this.textureLoader.load('source/assets/matcap_mod.jpg')},
                iGlobalTime: {type: 'f', value: 0}
            },
            transparent: false,
            defines: {
                USE_MAP: ''
            }
        });


        this.cubeGeom = new THREE.BoxBufferGeometry(2, 1.5, 1.5);
        this.cube = new THREE.Mesh(this.cubeGeom, this.shaderMaterial);
        this.cube.position.y = .75;
        this.cube.rotation.y = Math.PI * .5;
        this.scene.add(this.cube);


        this.backgroundContainer = new THREE.Object3D();
        this.backgroundLoopParams = {
            offset: 20,
            boxWidth: 0
        };

        this.blocks = [];
        this.blocksCloned = [];
        const colladaLoader = new THREE.ColladaLoader();
        colladaLoader.load('/source/assets/smart/Smart_Cities_Main_Scene_animationgroups_pivotcenter.DAE', colladaModel => {
            console.log(colladaModel);

            let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff];
            let scene_material = new THREE.MeshStandardMaterial({color: new THREE.Color(0xefefef)});
            let normal_material = new THREE.MeshNormalMaterial();


            this.backgroundScene_01 = colladaModel.scene.children[0];

            this.backgroundScene_01.children.forEach((obj, i) => {
                obj.material = this.shaderMaterial;
                // obj.material = scene_material;
                // obj.material = new THREE.MeshStandardMaterial({color: new THREE.Color(colors[i])});
                // obj.scale.z = 0.001;
                this.blocks.push(obj);
            });
            this.backgroundScene_01.position.z = 0;

            // this.backgroundScene_01.children[0].position.z = 300


            let box = new THREE.Box3().setFromObject(this.backgroundScene_01);
            this.backgroundLoopParams.boxWidth = box.getSize().z;
            this.backgroundLoopParams.distance = this.backgroundLoopParams.offset + this.backgroundLoopParams.boxWidth + this.backgroundLoopParams.offset;


            // clone?
            this.backgroundScene_01_Clone = this.backgroundScene_01.clone();
            this.backgroundScene_01_Clone.position.z = this.backgroundLoopParams.boxWidth;
            this.backgroundScene_01_Clone.children.forEach((obj, i) => {
                obj.scale.z = 0.001;
                this.blocksCloned.push(obj);
            });


            this.box_1 = new THREE.BoxHelper(this.backgroundScene_01, 0xff0000);
            this.box_2 = new THREE.BoxHelper(this.backgroundScene_01_Clone, 0x0000ff);
            this.scene.add(this.box_1);
            this.scene.add(this.box_2);

            // scale after Cloning
            this.blocks.forEach((obj, i) => {
                obj.scale.z = 0.001;
            });

            this.backgroundContainer.add(this.backgroundScene_01);
            this.backgroundContainer.add(this.backgroundScene_01_Clone);
            this.scene.add(this.backgroundContainer);

            this.initTimeline();

            this.initDAT();

            this.initTLBlocks()


        });


        this.initLights();


    }

    initTLBlocks() {
        this.tlBlocks = new TimelineMax({
            paused: true,
            onStartScope: this,
            onUpdate: () => {
            }
        });

        // TODO adjust order!
        this.tlBlocks
            .to([this.blocks[3].scale, this.blocksCloned[3].scale], 1, {z: 1, ease: Power2.easeOut}, '-=0.0')
            .to([this.blocks[1].scale, this.blocksCloned[1].scale], .9, {z: 1, ease: Power2.easeOut}, '-=0.9')
            .to([this.blocks[0].scale, this.blocksCloned[0].scale], .8, {z: 1, ease: Power2.easeOut}, '-=0.8')
            .to([this.blocks[2].scale, this.blocksCloned[2].scale], .7, {z: 1, ease: Power2.easeOut}, '-=0.7')
            .to([this.blocks[4].scale, this.blocksCloned[4].scale], .6, {z: 1, ease: Power2.easeOut}, '-=0.6')
    }


    doLoop() {
        this.tl.progress(0);
        this.tl.play();
    }


    initTimeline() {
        console.log('tl:', this.backgroundLoopParams.distance)
        this.tl = new TimelineMax({
            paused: true,
            // repeat: -1,
            onStartScope: this,
            onUpdate: () => {
                this.box_1.update();
                this.box_2.update();
                this.SETTINGS.tlProgress = this.tl.progress();
            }
        });

        this.tl
            .set(this.backgroundScene_01_Clone.position, {z: this.backgroundLoopParams.boxWidth}, '-=0.0')
            .to(this.backgroundContainer.position, 5.0, {
                z: -this.backgroundLoopParams.boxWidth,
                ease: Linear.easeNone
            }, '-=0.0')
            .set(this.backgroundScene_01.position, {z: 2 * this.backgroundLoopParams.boxWidth}, '-=0.0')
            .to(this.backgroundContainer.position, 5.0, {
                z: -2 * this.backgroundLoopParams.boxWidth,
                ease: Linear.easeNone
            }, '-=0.0')
            .call(this.doLoop, null, this);


        // TweenMax.delayedCall(1.5, () => {
        //     this.tl.play();
        // }, null, this);


    }


    initLights() {
        let pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(0, 100, 0);

        let ambLight = new THREE.AmbientLight(0xcccccc); // soft white light
        ambLight.intensity = .5;

        this.scene.add(pointLight);
        this.scene.add(ambLight);
    }


    resize(_width, _height) {
        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();
    }

    update() {

    }

    render() {

        this.sceneCameraController.update();
        this.renderer.render(this.scene, this.camera);
    }


    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SETTINGS, 'tlProgress').step(.001).name('tlProgress').listen();
        this.gui.add(this.SETTINGS, 'tlSpeed').min(0).max(5).step(.01).name('tlSpeed').listen().onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'togglePlay').onChange(this.togglePlay.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'fadeIn').onChange(this.fadeIn.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'playBlocks').onChange(this.playBlocks.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'reverseBlocks').onChange(this.reverseBlocks.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'startHover').onChange(this.startHover.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'stopHover').onChange(this.stopHover.bind(this));
        this.gui.add(this.SETTINGS, 'boundingBox').onChange(this.checkBoundingBox.bind(this));
    }

    checkBoundingBox() {
        if (this.SETTINGS.boundingBox) {
            this.scene.add(this.box_1);
            this.scene.add(this.box_2);
        } else {
            this.scene.remove(this.box_1);
            this.scene.remove(this.box_2);
        }
    }

    togglePlay() {
        if (this.tl.isActive()) {
            this.tl.pause();
            this.SETTINGS.tlSpeed = 0;
        } else {
            this.tl.play();
        }
    }

    fadeIn() {
        this.tl.play();

        TweenMax.to(this.SETTINGS, 3, {
            tlSpeed: 1,
            ease: Sine.easeIn,
            onUpdate: () => {
                this.tl.timeScale(this.SETTINGS.tlSpeed);
            }
        })
    }

    playBlocks() {
        this.tlBlocks.timeScale(1);
        this.tlBlocks.play();
    }

    reverseBlocks() {
        this.tlBlocks.timeScale(2);
        this.tlBlocks.reverse();
    }

    startHover() {
        this.sceneCameraController.startHover();
    }

    stopHover() {
        this.sceneCameraController.stopHover();
    }


    updateParams() {
        this.tl.timeScale(this.SETTINGS.tlSpeed);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SceneSetupBase;