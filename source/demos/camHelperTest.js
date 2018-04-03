/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
var meshline = require('three.meshline');
var OrbitControls = require('./../three/controls/OrbitControls')
const Mousetrap = require('mousetrap');

import {Vector2} from "../math/vector2";
import mathUtils from "../utils/mathUtils";

const PI = Math.PI;
const HALF_PI = Math.PI * .5;
const TWO_PI = Math.PI * 2;

class CamHelperTest {

    constructor() {

        console.log('CV3!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.vZero = new THREE.Vector3(0, 0, 0);
        this.vCamTarget = new THREE.Vector3(0, 0, 0);
        this.v3 = new THREE.Vector3(0, 0, 0);
        this.s = new THREE.Spherical();

        this.SPHERICAL = {
            phi: HALF_PI - .2,
            theta: 0,
            radius: 10,
            stepPhi: .05,
            stepTheta: .05
        };

        this.vMouse = new Vector2();
        this.vMouse.pressed = false;

        this.SETTINGS = {
            centerX: 0,
            centerY: 0,
            METHODS: {
                toggleCamHelper: () => {
                }
            }
        };

        this.initThreeStuff();
        this.initKeyControls();
        this.initHelperTools();
        this.initListener();
        this.initDAT()

    }

    initKeyControls() {
        Mousetrap.bind('w', this.phiStepPlus.bind(this));
        Mousetrap.bind('s', this.phiStepMinus.bind(this));
        Mousetrap.bind('a', this.thetaStepPlus.bind(this));
        Mousetrap.bind('d', this.thetaStepMinus.bind(this));
    }


    initThreeStuff() {

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 0;
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: false,
            autoClear: true
        });
        this.renderer.setClearColor(0xcccccc, 1);


        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);
        this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

    }


    phiStepPlus() {
        this.SPHERICAL.phi += this.SPHERICAL.stepPhi;
    }

    phiStepMinus() {
        this.SPHERICAL.phi -= this.SPHERICAL.stepPhi;
    }

    thetaStepPlus() {
        this.SPHERICAL.theta += this.SPHERICAL.stepTheta;
    }

    thetaStepMinus() {
        this.SPHERICAL.theta -= this.SPHERICAL.stepTheta;
    }


    initHelperTools() {

        this.scene.add(new THREE.GridHelper(10, 10));
        this.scene.add(new THREE.AxesHelper(1));


        this.drivenCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100);
        this.camHelper = new THREE.CameraHelper(this.drivenCamera);
        this.scene.add(this.camHelper);
        this.camHelperVisible = true;

        const geometry = new THREE.CubeGeometry(1, 1, 1, 5, 5, 5);
        const material = new THREE.MeshNormalMaterial({
            wireframe: false
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);


        const line_material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        this.line_geom = new THREE.Geometry();
        this.line_geom.vertices[0] = this.vZero;
        this.line_geom.vertices[1] = this.v3;
        this.line = new THREE.Line(this.line_geom, line_material);
        this.scene.add(this.line);

        //create a blue LineBasicMaterial
        this.draw_line_material = new THREE.LineBasicMaterial({
            color: 0x00ffcc,
        });
        this.draw_line_geometry = new THREE.Geometry();
        for (let i = 0; i < 30; i++) {
            this.draw_line_geometry.vertices.push(new THREE.Vector3(0, 100, 0))
        }
        this.draw_line = new THREE.Line(this.draw_line_geometry, this.draw_line_material);
        this.scene.add(this.draw_line);


    }

    toggleCamHelper() {
        this.camHelperVisible = !this.camHelperVisible;

        if (!this.camHelperVisible) {
            this.scene.remove(this.camHelper);
        } else {
            this.scene.add(this.camHelper);
        }

    }

    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SPHERICAL, 'phi').min(0).max(TWO_PI).step(.01).name('phi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'theta').min(0).max(TWO_PI).step(.01).name('theta').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'radius').min(0).max(10).step(.01).name('radius').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepPhi').min(0.001).max(.100).step(.001).name('stepPhi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepTheta').min(0.001).max(.100).step(.001).name('stepTheta').onChange(this.updateParams.bind(this));
        this.gui.add(this.SETTINGS.METHODS, 'toggleCamHelper').onChange(this.toggleCamHelper.bind(this));
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

        this.resolution.set(_width, _height);

    }

    setObjectPosition(o, v) {
        o.position.x = v.x;
        o.position.y = v.y;
        o.position.z = v.z;
    }

    updateParams() {
        this.s.set(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s);
        // this.setObjectPosition(this.cube, this.v3);

        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;
    }


    update() {
        // this.cube.rotation.y += (this.SETTINGS.targetRotation - this.cube.rotation.y) * 0.05;

        if (this.SPHERICAL.phi >= Math.PI * 2) {
            this.SPHERICAL.phi = 0;
        }

        this.s = new THREE.Spherical(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s);

        this.setObjectPosition(this.drivenCamera, this.v3);
        this.drivenCamera.lookAt(this.vCamTarget);
        this.drivenCamera.position.add(new THREE.Vector3(1,0,0))

        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;

        this.controls.update();
    }

    render() {

        this.renderer.render(this.scene, this.drivenCamera);
        // this.renderer.render(this.scene, this.camera);
    }

}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default CamHelperTest;