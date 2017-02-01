/**
 * Created by STORMSEN on 01.12.2016.
 */

// var PIXI = require('pixi.js');

import {Vector2} from '../math/vector2';
var THREE = require('three');
var OrbitControls = require('./../three/controls/OrbitControls')

const PI = Math.PI;
const HALF_PI = Math.PI * .5;
const TWO_PI = Math.PI * 2;

class SphericalLight {


    constructor() {

        console.log('CV3!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.vZero = new THREE.Vector3(0, 0, 0)
        this.v3 = new THREE.Vector3(0, 0, 0);
        this.SPHERICAL = {
            phi: 0,
            theta: 0,
            radius: 200,
            stepPhi: .005,
            stepTheta: .02
        }
        this.step = .05;
        this.s = new THREE.Spherical();


        this.vMouse = new Vector2();
        this.vMouse.pressed = false;

        this.SETTINGS = {
            centerX: 0,
            centerY: 0,
            targetRotation: 0,
            targetRotationOnMouseDown: 0,
            mouseXOnMouseDown: 0,
            mouseX: 0
        }

        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 5000);
        this.camera.position.x = -300;
        this.camera.position.y = -200;
        this.camera.position.z = 1000;


        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xc3c3c3, .5);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        this.initGeometry();
        this.initLights();
        this.initListener();
        this.initDAT()

    }

    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SPHERICAL, 'phi').min(0).max(TWO_PI).step(.01).name('phi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'theta').min(0).max(TWO_PI).step(.01).name('theta').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'radius').min(0).max(300).step(.01).name('radius').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepPhi').min(0.01).max(.5).step(.001).name('stepPhi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepTheta').min(0.01).max(.5).step(.001).name('stepTheta').onChange(this.updateParams.bind(this));
    }

    updateParams() {
        this.s = new THREE.Spherical(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s)

        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;

        this.lightHelper.update();
        if (this.SPHERICAL.phi >= Math.PI * 2) {
            this.SPHERICAL.phi = 0;
        }
        this.SPHERICAL.phi += this.SPHERICAL.stepPhi;
        this.SPHERICAL.theta += this.SPHERICAL.stepTheta;

        this.setObjectPosition(this.cube, this.v3);
        this.spotLight.position.set(this.v3.x, this.v3.y, this.v3.z);
        //this.cube.lookAt(this.vZero)
    }

    initLights() {
        this.spotLight = new THREE.SpotLight(0xa8d1e2);
        this.spotLight.position.set(100, 300, 100);

        this.spotLight.castShadow = true;
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.125;
        this.spotLight.decay = 2;
        this.spotLight.distance = 1000;
        this.spotLight.intensity = 2;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 1;
        this.spotLight.shadow.camera.far = 1000;

        this.lightHelper = new THREE.SpotLightHelper(this.spotLight);

        var targetObject = new THREE.Object3D();
        targetObject.position.y = this.floor.position.y;
        this.camera.lookAt(new THREE.Vector3(0, targetObject.position.y, 0));
        this.controls.target.set(0, targetObject.position.y, 0);
        this.spotLight.target = targetObject;


        this.ambient = new THREE.AmbientLight(0xe5b357, .1)

        this.scene.add(this.spotLight);
        this.scene.add(this.ambient);
        this.scene.add(this.lightHelper);
        this.scene.add(targetObject);


    }

    initGeometry() {

        var geometry = new THREE.SphereGeometry(10, 10, 10);
        var material = new THREE.MeshNormalMaterial();
        this.sphere = new THREE.Mesh(geometry, material);

        this.scene.add(this.sphere)


        var line_material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        this.line_geom = new THREE.Geometry();
        this.line_geom.vertices[0] = this.vZero;
        this.line_geom.vertices[1] = this.v3;
        this.line = new THREE.Line(this.line_geom, line_material);
        this.scene.add(this.line);

        geometry = new THREE.CubeGeometry(20, 20, 20, 5, 5, 5);
        material = new THREE.MeshNormalMaterial({
            wireframe: false
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);


        //Create a plane that receives shadows (but does not cast them)
        var floorGeom = new THREE.BoxGeometry(2000, 1, 2000);
        var floorMaterial = new THREE.MeshPhongMaterial({color: 0xaaaaaa})
        this.floor = new THREE.Mesh(floorGeom, floorMaterial);
        this.floor.receiveShadow = true;
        this.floor.position.y = -500;


        var isoGeom = new THREE.IcosahedronBufferGeometry(50, 1);
        var isoMaterial = new THREE.MeshStandardMaterial({
            color: 0x6ca6d3,
            shading: THREE.FlatShading
        });
        this.box = new THREE.Mesh(isoGeom, isoMaterial);
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.box.position.y = -350;


        this.scene.add(this.floor);
        this.scene.add(this.box);


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

        // this.SETTINGS.mouseXOnMouseDown = event.clientX - this.SETTINGS.centerX;
        // this.SETTINGS.targetRotationOnMouseDown = this.SETTINGS.targetRotation;
    }

    onPointerUp(event) {
        this.vMouse.pressed = false;
    }

    onPointerMove(event) {
        const {clientX: x, clientY: y} = (
            event.changedTouches ? event.changedTouches[0] : event
        );

        // console.log(x, y)

        // if (this.vMouse.pressed) {
        //     this.SETTINGS.mouseX = event.clientX - this.SETTINGS.centerX;
        //     this.SETTINGS.targetRotation = this.SETTINGS.targetRotationOnMouseDown + ( this.SETTINGS.mouseX - this.SETTINGS.mouseXOnMouseDown ) * 0.02;
        // }
    }

    resize(_width, _height) {

        this.SETTINGS.centerX = _width / 2;
        this.SETTINGS.centerY = _width / 2;

        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();

    }

    setObjectPosition(o, v) {
        o.position.x = v.x;
        o.position.y = v.y;
        o.position.z = v.z;
    }

    // TODO GSAP-TEST!


    update() {

        //return

        this.lightHelper.update();

        if (this.SPHERICAL.phi >= Math.PI * 2) {
            this.SPHERICAL.phi = 0;
        }
        this.SPHERICAL.phi += this.SPHERICAL.stepPhi;
        this.SPHERICAL.theta += this.SPHERICAL.stepTheta;

        this.s = new THREE.Spherical(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s)

        this.setObjectPosition(this.cube, this.v3);
        this.spotLight.position.set(this.v3.x, this.v3.y, this.v3.z);
        //this.cube.lookAt(this.vZero)

        // var a = new THREE.Euler(0, this.step, 0, 'XYZ');
        // this.v3.applyEuler(a);


        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;


        //this.draw_line_geometry.vertices.pop()
        //this.draw_line_geometry.vertices.unshift(this.v3.clone());
        //this.draw_line.geometry.verticesNeedUpdate = true;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SphericalLight;