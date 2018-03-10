/**
 * Created by STORMSEN on 01.12.2016.
 */

// var THREE = require('three');
import * as THREE from 'three';
import {Vector2} from "../math/vector2";

var OrbitControls = require('./../three/controls/OrbitControls');

import CameraControls from './../three/controls/camera-controls.js';

CameraControls.install({THREE: THREE});

var gsap = require('gsap');

var ColladaLoader = require('../three/loader/colladaLoader');

class SceneSetupBase {

    constructor() {

        console.log('1!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock();
        this.delta = 0;
        this.elapsed = 0;

        this.SETTINGS = {
            tlProgress: 0.0,
            tlSpeed: 1,
            METHODS: {
                togglePlay: function () {
                },
                reset: function () {
                }
            },
        };

        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 1.7;
        this.camera.position.z = 6;


        this.pointLight = new THREE.PointLight(0xa8d1e2);

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

        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
        this.cameraControls.enableDamping = true;
        this.cameraControls.dampingFactor = 0.05;
        this.cameraControls.draggingDampingFactor = 0.25;
        this.cameraControls.enableZoom = true;
        this.cameraControls.minDistance = 3;
        this.cameraControls.maxDistance = 100;
        this.cameraControls.minPolarAngle = .2;
        this.cameraControls.maxPolarAngle = Math.PI * .45;

        let size = 100;
        let divisions = 10;

        let gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);


        this.backgroundContainer = new THREE.Object3D();
        this.backgroundLoopParams = {
            offset: 20,
            boxWidth: 0,
            distance: 0
        };
        const colladaLoader = new THREE.ColladaLoader();
        colladaLoader.load('/source/assets/smart/Smart_Cities_Main_Scene_animationgroups_pivotcenter.DAE', colladaModel => {
            console.log(colladaModel);

            let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff];
            let scene_material = new THREE.MeshStandardMaterial({color: new THREE.Color(0xcccccc)});


            this.backgroundScene_01 = colladaModel.scene.children[0];

            this.backgroundScene_01.children.forEach((obj, i) => {
                // obj.material = scene_material;
                console.log(i, obj);
                obj.material = new THREE.MeshStandardMaterial({color: new THREE.Color(colors[i])});
            });
            this.backgroundScene_01.position.z = 0;

            // this.backgroundScene_01.children[0].position.z = 300


            let box = new THREE.Box3().setFromObject(this.backgroundScene_01);
            console.log('box-size', box.getSize());
            this.backgroundLoopParams.boxWidth = box.getSize().z;
            this.backgroundLoopParams.distance = this.backgroundLoopParams.offset + this.backgroundLoopParams.boxWidth + this.backgroundLoopParams.offset;

            this.box_1 = new THREE.BoxHelper(this.backgroundScene_01, 0xff0000);
            this.scene.add(this.box_1);

            this.backgroundScene_01_Clone = this.backgroundScene_01.clone();
            this.backgroundScene_01_Clone.position.z = this.backgroundLoopParams.boxWidth;

            this.box_2 = new THREE.BoxHelper(this.backgroundScene_01_Clone, 0x0000ff);
            this.scene.add(this.box_2);

            this.backgroundContainer.add(this.backgroundScene_01);
            this.backgroundContainer.add(this.backgroundScene_01_Clone);
            this.scene.add(this.backgroundContainer);

            this.initTimeline();
            TweenMax.delayedCall(1, this.moveCam, null, this);

            this.initDAT();

        });


        this.initLights();

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
            .to(this.backgroundContainer.position, 5.0, {z: -this.backgroundLoopParams.boxWidth, ease: Linear.easeNone}, '-=0.0')
            .set(this.backgroundScene_01.position, {z: 2 * this.backgroundLoopParams.boxWidth}, '-=0.0')
            .to(this.backgroundContainer.position, 5.0, {z: -2 * this.backgroundLoopParams.boxWidth, ease: Linear.easeNone}, '-=0.0')
            .call(this.doLoop, null, this);


        TweenMax.delayedCall(1.5, () => {
            this.tl.play();
        }, null, this);


    }


    moveCam() {
        this.cameraControls.rotate(
            -90 * THREE.Math.DEG2RAD,
            10 * THREE.Math.DEG2RAD,
            true
        )
    }


    initLights() {
        this.pointLight.position.set(0, 300, 0);
        this.lightHelper = new THREE.PointLightHelper(this.pointLight);

        this.scene.add(this.pointLight);
        this.scene.add(this.lightHelper);
    }


    resize(_width, _height) {
        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();
    }

    update() {

    }


    render() {

        this.needsUpdate = this.clock.getDelta();
        this.cameraControls.update(this.needsUpdate);
        this.renderer.render(this.scene, this.camera);
    }


    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SETTINGS, 'tlProgress').step(.001).name('tlProgress').listen();
        this.gui.add(this.SETTINGS, 'tlSpeed').min(0).max(5).step(.01).name('tlSpeed').onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'togglePlay').onChange(this.togglePlay.bind(this));
    }

    togglePlay() {
        this.tl.isActive() ? this.tl.pause() : this.tl.play();
    }

    updateParams() {
        this.tl.timeScale(this.SETTINGS.tlSpeed);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SceneSetupBase;