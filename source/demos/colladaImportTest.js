/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
import {Vector2} from "../math/vector2";

var OrbitControls = require('./../three/controls/OrbitControls');

import CameraControls from './../three/controls/camera-controls.js';

CameraControls.install({THREE: THREE});

var gsap = require('gsap');

var ColladaLoader = require('../three/loader/colladaLoader');

class ColladaImportTest {

    constructor() {

        console.log('Demo!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock();
        this.delta = 0;
        this.elapsed = 0;

        this.vMouse = new Vector2();
        this.vMouse.pressed = false;

        this.SETTINGS = {
            centerX: 0,
            centerY: 0,
            targetRotation: {x: 0, y: 0},
            targetRotationOnMouseDown: {x: 0, y: 0},
            tapLocation: {x: 0, y: 0},
            pointer: {x: 0, y: 0}
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
        this.cameraControls.draggingDampingFactor = 0.5;
        this.cameraControls.enableZoom = true;



        let size = 100;
        let divisions = 10;

        let gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);


        const colladaLoader = new THREE.ColladaLoader();
        colladaLoader.load('/source/assets/smart/Smart_Cities_Main_Scene_01.DAE', colladaModel => {
            console.log(colladaModel);

            let group_1 = colladaModel.scene.children[0];
            let group_2 = colladaModel.scene.children[1];

            let material_1 = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0xff0000)
                }
            );

            let material_2 = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0x0000ff)
                }
            );

            group_1.children.forEach(mesh => {
                mesh.material = material_1;
            });

            group_2.children.forEach(mesh => {
                mesh.material = material_2;
            });


            this.scene.add(group_1);
            this.scene.add(group_2);

            TweenMax.delayedCall(1, this.moveCam, [this])

        });


        this.initLights();
        this.initListener();

    }


    moveCam(scope) {
        scope.cameraControls.rotate(
            -90 * THREE.Math.DEG2RAD,
            10 * THREE.Math.DEG2RAD,
            true
        )
    }


    initLights() {

        this.pointLight.position.set(0, 300, 100);
        this.lightHelper = new THREE.PointLightHelper(this.pointLight);

        this.scene.add(this.pointLight);
        this.scene.add(this.lightHelper);
    }


    initListener() {

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);


        this.screen.addEventListener('mousedown', this.onPointerDown, false);
        this.screen.addEventListener('touchstart', this.onPointerDown, false);

        this.screen.addEventListener('mouseup', this.onPointerUp, false);
        this.screen.addEventListener('touchend', this.onPointerUp, false);

        this.screen.addEventListener('mousemove', this.onPointerMove, false);
        this.screen.addEventListener('touchmove', this.onPointerMove, false);
    }


    onPointerDown(event) {
        this.vMouse.pressed = true;

        this.SETTINGS.tapLocation.x = event.clientX - this.SETTINGS.centerX;
        this.SETTINGS.tapLocation.y = event.clientY - this.SETTINGS.centerY;
        this.SETTINGS.targetRotationOnMouseDown.y = this.SETTINGS.targetRotation.y;
        this.SETTINGS.targetRotationOnMouseDown.x = this.SETTINGS.targetRotation.x;
    }

    onPointerUp(event) {
        this.vMouse.pressed = false;
    }

    onPointerMove(event) {
        const {clientX: x, clientY: y} = (
            event.changedTouches ? event.changedTouches[0] : event
        );

        // console.log(x, y)

        if (this.vMouse.pressed) {
            this.SETTINGS.pointer.x = event.clientX - this.SETTINGS.centerX;
            this.SETTINGS.pointer.y = event.clientY - this.SETTINGS.centerY;
            this.SETTINGS.targetRotation.y = this.SETTINGS.targetRotationOnMouseDown.y + (this.SETTINGS.pointer.x - this.SETTINGS.tapLocation.x) * 0.02;
            this.SETTINGS.targetRotation.x = this.SETTINGS.targetRotationOnMouseDown.x + (this.SETTINGS.pointer.y - this.SETTINGS.tapLocation.y) * 0.02;
        }
    }

    resize(_width, _height) {
        this.SETTINGS.centerX = _width / 2;
        this.SETTINGS.centerY = _width / 2;

        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();

    }

    update() {
        // this.delta = this.clock.getDelta();
        // this.elapsed = this.clock.getElapsedTime();
        // this.needsUpdate = this.cameraControls.update(this.delta);

        // this.controls.update();
    }

    render() {

        // this.delta = this.clock.getDelta();
        this.delta+=.01
        this.cameraControls.update(this.clock.getDelta());

        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default ColladaImportTest;