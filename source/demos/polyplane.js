/**
 * Created by STORMSEN on 01.12.2016.
 */

// Based on ...
// https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader
// https://github.com/spite/spherical-environment-mapping
//     +
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js

var THREE = require('three');
var gsap = require('gsap');
var OBJLoader = require('three-obj-loader')(THREE);
var ShaderLoader = require('./../three/ShaderLoader');
var OrbitControls = require('./../three/controls/OrbitControls');
var SubdivisionModifier = require('./../three/modifiers/SubdivisionModifier');
var BufferSubdivisionModifier = require('./../three/modifiers/BufferSubdivisionModifier');

var SimplexNoise = require('simplex-noise');

import {Vector2} from '../math/vector2';


// https://github.com/mrdoob/three.js/blob/dev/examples/js/modifiers/BufferSubdivisionModifier.js

class Polyplane {


    constructor() {

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);


        this._axis = new THREE.Vector3(.5, .5, 0).normalize();
        this._axis2 = new THREE.Vector3(0, .5, .5).normalize();
        this._quaternion = new THREE.Quaternion();
        this._quaternion2 = new THREE.Quaternion();

        this.clock = new THREE.Clock(true);
        this.noise3 = 0;
        this.lights = [];
        this.textureLoader = new THREE.TextureLoader();
        this.objLoader = new THREE.OBJLoader()

        this.vMouse = new Vector2();
        this.vMouse.pressed = false;

        this.SETTINGS = {
            centerX: 0,
            centerY: 0,
            noiseScale: .05,
            maxHeight: 2,
            deltaNoise: .005,
            targetRotation: 0,
            targetRotationOnMouseDown: 0,
            mouseXOnMouseDown: 0,
            mouseX: 0
        };

        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 150;
        this.camera.position.z = 100;

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        var gridHelper = new THREE.GridHelper(100, 50);
        this.scene.add(gridHelper);

        var axesHelper = new THREE.AxesHelper(10);
        this.scene.add(axesHelper);


        this.initListener();

        this.makePlane();
        this.initLights();

        this.initDAT();


    }


    initLights() {
        let position = new THREE.Vector3(0, 100, 0)

        this.geo = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1, 1),
            new THREE.MeshPhongMaterial({color: 0xffcc33, wireframe: false, shininess: 0, emissive: new THREE.Color(0xffcc33), emissiveIntensity: 1}),
        );
        this.geo.name = "geo";
        this.geo.position.set(0, 100, 0);

        this.geo2 = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1, 1),
            new THREE.MeshPhongMaterial({color: 0x33ccff, wireframe: false, shininess: 0, emissive: new THREE.Color(0x33ccff), emissiveIntensity: 1})
        );
        this.geo2.name = "geo2";
        this.geo2.position.set(0, 0, 100);

        this.pLight_01 = new THREE.PointLight(0xffcc33, 1.3, 200, 2);
        this.pLight_01.position.set(0, 100, 0);
        this.pLight_01.castShadow = true;
        this.pLight_01.shadow.mapSize.width = 1024;
        this.pLight_01.shadow.mapSize.height = 1024;
        this.pLight_01.shadow.camera.near = 1;
        this.pLight_01.shadow.camera.far = 500;

        this.pLight_02 = new THREE.PointLight(0x33ccff, 1.3, 200, 2);
        this.pLight_02.position.set(0, 0, 100);
        this.pLight_02.castShadow = true;
        this.pLight_02.shadow.mapSize.width = 1024;
        this.pLight_02.shadow.mapSize.height = 1024;
        this.pLight_02.shadow.camera.near = 1;
        this.pLight_02.shadow.camera.far = 500;


        this.scene.add(this.geo);
        this.scene.add(this.geo2);
        this.scene.add(this.pLight_01);
        this.scene.add(this.pLight_02);
    }

    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SETTINGS, 'deltaNoise').min(0.001).max(0.05).step(.001).name('deltaNoise').onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS, 'noiseScale').min(0.01).max(.1).step(.001).name('noiseScale').onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS, 'maxHeight').min(0.1).max(10).step(.01).name('maxHeight').onChange(this.updateParams.bind(this));
    }

    updateParams() {

    }

    updatePlaneGeometry() {
        this.planeMesh.geometry.verticesNeedUpdate = true;

        for (var i = 0; i < this.planeMesh.geometry.vertices.length; i++) {
            let v = this.planeMesh.geometry.vertices[i];
            let noiseValue = this.SIMPLEX.noise3D(v.x * this.SETTINGS.noiseScale, v.y * this.SETTINGS.noiseScale, this.noise3) * this.SETTINGS.maxHeight;
            v.z = noiseValue;
        }
    }

    makePlane() {
        this.SIMPLEX = new SimplexNoise();
        this.planeGeom = new THREE.PlaneGeometry(150, 150, 30, 30);
        this.planeMaterial = new THREE.MeshPhongMaterial({
            wireframe: false,
            side: THREE.DoubleSide,
            flatShading: true
        });
        this.planeMesh = new THREE.Mesh(this.planeGeom, this.planeMaterial);
        this.planeMesh.rotateX(-Math.PI * .5)
        this.planeMesh.geometry.verticesNeedUpdate = true;
        this.planeMesh.geometry.normalsNeedUpdate = true;
        this.planeMesh.geometry.uvsNeedUpdate = true;
        this.planeMesh.geometry.computeFaceNormals();
        this.planeMesh.geometry.computeVertexNormals();
        this.planeMesh.geometry.computeMorphNormals();
        this.planeMesh.geometry.dynamic = true;
        this.planeMesh.receiveShadow = true;
        this.scene.add(this.planeMesh);

        this.updatePlaneGeometry();
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

        this.SETTINGS.mouseXOnMouseDown = event.clientX - this.SETTINGS.centerX;
        this.SETTINGS.targetRotationOnMouseDown = this.SETTINGS.targetRotation;
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
            this.SETTINGS.mouseX = event.clientX - this.SETTINGS.centerX;
            this.SETTINGS.targetRotation = this.SETTINGS.targetRotationOnMouseDown + ( this.SETTINGS.mouseX - this.SETTINGS.mouseXOnMouseDown ) * 0.02;
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
        this.noise3 += this.SETTINGS.deltaNoise;
        this.updatePlaneGeometry();

        this._quaternion.setFromAxisAngle(this._axis, .005);
        this.geo.position.applyQuaternion(this._quaternion);
        this.pLight_01.position.applyQuaternion(this._quaternion);

        this._quaternion2.setFromAxisAngle(this._axis2, .0075);
        this.geo2.position.applyQuaternion(this._quaternion2);
        this.pLight_02.position.applyQuaternion(this._quaternion2);


    }

    render() {

        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Polyplane;