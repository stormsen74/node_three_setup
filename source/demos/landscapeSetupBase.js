/**
 * Created by STORMSEN on 01.12.2016.
 */

// var THREE = require('three');
import * as THREE from 'three';
import {Vector2} from "../math/vector2";

import SceneCameraController from "./SceneCameraController";

var gsap = require('gsap');

var ColladaLoader = require('../three/loader/colladaLoader');

var glslify = require('glslify');

class LandscapeSetupBase {

    constructor() {

        console.log('1!')

        this.textureLoader = new THREE.TextureLoader();

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock();
        this.delta = 0;
        this.elapsed = 0;
        this.size = {
            w: window.innerWidth,
            h: window.innerHeight
        }

        this.SETTINGS = {
            tlProgress: 0.0,
            tlSpeed: 0,
            zoom: 1,
            meshScaleZ: .1,
            METHODS: {
                zoom: () => {
                },
                moveTo: () => {
                },
                offsetCamera: () => {
                },
                resetCamera: () => {
                },
                setInitialState: () => {
                },
                driveToState: () => {
                },
                startHover: () => {
                },
                stopHover: () => {
                }
            },
        };

        this.scene = new THREE.Scene();


        this.camera = new THREE.PerspectiveCamera(50, this.size.w / this.size.h, 1, 1000);
        this.camera.position.y = .8;
        this.camera.position.z = 5.2;
        this.camHelper = new THREE.CameraHelper(this.camera);
        // this.scene.add(this.camHelper);


        this.debugCam = new THREE.PerspectiveCamera(50, this.size.w / this.size.h, 1, 10000);
        this.debugCam.position.z = 0;
        this.debugCam.position.x = -10;
        this.debugCam.position.y = 10;
        this.debugCam.lookAt(new THREE.Vector3());


        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            stencil: false
        });
        this.renderer.setClearColor(0xc3c3c3, .5);

        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);


        this.sceneCameraController = new SceneCameraController(this.camera, this.renderer.domElement);


        this.scene.add(new THREE.GridHelper(10, 10));
        this.scene.add(new THREE.AxesHelper(1));



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


        this.cubeGeom = new THREE.BoxBufferGeometry(.5, .5, .5);
        this.cube = new THREE.Mesh(this.cubeGeom, this.shaderMaterial);
        this.cube.position.y = .25;
        this.cube.rotation.y = Math.PI * .5;
        // this.scene.add(this.cube);


        this.scene.add(new THREE.AxesHelper(1));


        this.backgroundContainer = new THREE.Object3D();
        this.backgroundLoopParams = {
            offset: 20,
            boxWidth: 0
        };

        this.blocks = [];
        this.blocksCloned = [];
        let texLoader = new THREE.TextureLoader();
        const colladaLoader = new THREE.ColladaLoader();
        colladaLoader.load('/source/assets/smart/SC_Landscape_test_Z_up.DAE', colladaModel => {
            console.log(colladaModel);

            let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff];
            let scene_material = new THREE.MeshStandardMaterial({color: new THREE.Color(0xefefef)});
            let normal_material = new THREE.MeshNormalMaterial();
            const landscapeMaterial_1 = new THREE.MeshBasicMaterial({
                map: texLoader.load('/source/assets/smart/SC_Landscape_Lightmap.png')
            });


            this.landscapeMesh_01 = colladaModel.scene.children[0].children[0];
            const geom = new THREE.Geometry().fromBufferGeometry(this.landscapeMesh_01.geometry)
            this.landscapeMesh_01.geometry = geom;
            this.landscapeMesh_01.rotation.x = this.degToRad(-90);
            this.landscapeMesh_01.rotation.z = this.degToRad(-90);
            this.landscapeMesh_01.position.z = 47; // x
            this.landscapeMesh_01.position.y = 0; // 4.8 y
            this.landscapeMesh_01.position.x = 80; // z
            this.landscapeMesh_01.scale.x = .89;
            this.landscapeMesh_01.scale.z = .1;
            this.landscapeMesh_01.material = landscapeMaterial_1;
            this.backgroundContainer.add(this.landscapeMesh_01);
            this.scene.add(this.backgroundContainer);
            this.scene.add(this.camHelper);


            this.initDAT();


        });


        this.initLights();




    }


    degToRad(deg) {
        return deg * 0.0174533;
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
        // this.scene.rotation.y += .001;
    }

    render() {
        this.sceneCameraController.update();


        // this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        // this.renderer.render(this.scene, this.camera);

        // this.renderer.setViewport(100, 0, window.innerWidth * .5, window.innerHeight * .5);
        this.renderer.render(this.scene, this.camera);
        // this.renderer.render(this.scene, this.debugCam);
    }


    initDAT() {
        this.gui = new dat.GUI();

        // this.gui.add(this.SETTINGS, 'tlProgress').step(.001).name('tlProgress').listen();
        // this.gui.add(this.SETTINGS, 'tlSpeed').min(0).max(5).step(.01).name('tlSpeed').listen().onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'setInitialState').onChange(this.setInitialState.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'moveTo').onChange(this.moveTo.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'zoom').onChange(this.zoom.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'offsetCamera').onChange(this.offsetCamera.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'resetCamera').onChange(this.resetCamera.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'driveToState').onChange(this.driveToState.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'startHover').onChange(this.startHover.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'stopHover').onChange(this.stopHover.bind(this));
        this.gui.add(this.SETTINGS, 'meshScaleZ').min(-.5).max(2).step(.01).name('meshScaleZ').listen().onChange(this.updateMeshScale.bind(this));
    }


    zoom() {
        this.sceneCameraController.zoomTo(3);
    }

    moveTo() {
        this.sceneCameraController.moveTo(0, 0, 10, false)
    }

    offsetCamera() {
        this.camera.setViewOffset(this.size.w, this.size.h, -300, 0, this.size.w, this.size.h);
        this.camera.updateProjectionMatrix();
    }

    resetCamera() {
        this.camera.setViewOffset(this.size.w, this.size.h, 0, 0, this.size.w, this.size.h);
        this.camera.updateProjectionMatrix();
    }

    driveToState() {
        this.sceneCameraController.driveToState();
    }

    setInitialState() {
        this.sceneCameraController.setFromState();
    }

    startHover() {
        this.sceneCameraController.startHover();
    }

    stopHover() {
        this.sceneCameraController.stopHover();
    }


    updateMeshScale() {
        this.landscapeMesh_01.scale.z = this.SETTINGS.meshScaleZ;
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default LandscapeSetupBase;