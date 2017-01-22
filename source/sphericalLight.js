/**
 * Created by STORMSEN on 01.12.2016.
 */

// var PIXI = require('pixi.js');

import {Vector2} from './math/vector2';
var THREE = require('three');

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
            stepAngle: .01,
            stepTheta: .1
        }
        this.step = .05;
        this.s = new THREE.Spherical();


        this.vMouse = new Vector2();
        this.vMouse.pressed = false;

        this.INTERACTION = {
            centerX: 0,
            centerY: 0,
            targetRotation: 0,
            targetRotationOnMouseDown: 0,
            mouseXOnMouseDown: 0,
            mouseX: 0
        }

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 100;
        this.camera.position.z = 500;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.initGeometry();
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
    }

    initGeometry() {

        var geometry = new THREE.SphereGeometry(10, 10, 10);
        var material = new THREE.MeshNormalMaterial();
        this.sphere = new THREE.Mesh(geometry, material);

        this.scene.add(this.sphere)


        var line_material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
        });

        this.line_geom = new THREE.Geometry();
        this.line_geom.vertices[0] = this.vZero;
        this.line_geom.vertices[1] = this.v3;
        this.line = new THREE.Line(this.line_geom, line_material);
        this.scene.add(this.line);


        //Create a plane that receives shadows (but does not cast them)
        var planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 32, 32);
        var planeMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00})
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.translateY(-this.SPHERICAL.radius)
        this.plane.rotateX(-HALF_PI)

        //plane.y = 100;
        //plane.receiveShadow = true;      6 wr7ooöppoöokiö535787zu8776u5
        this.scene.add(this.plane);


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

        // this.INTERACTION.mouseXOnMouseDown = event.clientX - this.INTERACTION.centerX;
        // this.INTERACTION.targetRotationOnMouseDown = this.INTERACTION.targetRotation;
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
        //     this.INTERACTION.mouseX = event.clientX - this.INTERACTION.centerX;
        //     this.INTERACTION.targetRotation = this.INTERACTION.targetRotationOnMouseDown + ( this.INTERACTION.mouseX - this.INTERACTION.mouseXOnMouseDown ) * 0.02;
        // }
    }

    resize(_width, _height) {

        this.INTERACTION.centerX = _width / 2;
        this.INTERACTION.centerY = _width / 2;

        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();

    }

    // TODO GSAP-TEST!


    update() {
        // this.cube.rotation.y += ( this.INTERACTION.targetRotation - this.cube.rotation.y ) * 0.05;

        //this.plane.rotateX(.01)

        return


        if (this.SPHERICAL.phi >= Math.PI * 2) {
            this.SPHERICAL.phi = 0;
            //this.theta += .1;
        }
        this.SPHERICAL.phi += this.SPHERICAL.stepPhi;
        this.SPHERICAL.theta += this.SPHERICAL.stepTheta;
        //this.phi += this.step;

        // var axis = new THREE.Vector3(0, 1, 0)
        // this.v3.applyAxisAngle(axis, this.step)

        this.s = new THREE.Spherical(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s)

        // var a = new THREE.Euler(0, this.step, 0, 'XYZ');
        // this.v3.applyEuler(a);


        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;


        this.draw_line_geometry.vertices.pop()
        this.draw_line_geometry.vertices.unshift(this.v3.clone());
        this.draw_line.geometry.verticesNeedUpdate = true;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SphericalLight;