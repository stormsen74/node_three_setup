/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
var EffectComposer = require('three-effectcomposer')(THREE)
var POSTPROCESSING = require('postprocessing');

import {Vector2} from '../math/vector2';

class Demo {

    constructor() {

        console.log('Demo!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock(true);

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

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 150;
        this.camera.position.z = 500;

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.initGeometry();
        this.initComposer();
        this.initListener();

    }

    initComposer() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new POSTPROCESSING.RenderPass(this.scene, this.camera));

        //this.passes = {
        //    glitchPass: new POSTPROCESSING.GlitchPass()
        //}

        // this.pass = new POSTPROCESSING.GlitchPass();
        // this.pass.renderToScreen = true;
        // this.composer.addPass(this.pass);

        this.pass2 = new POSTPROCESSING.BokehPass();
        this.pass2.renderToScreen = true;
        this.composer.addPass(this.pass2);

    }

    initGeometry() {

        var geometry = new THREE.BoxGeometry(200, 200, 200);
        var material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.y = 150;
        this.scene.add(this.cube)

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

        this.composer.setSize(_width, _height);

    }

    update() {
        this.cube.rotation.y += ( this.SETTINGS.targetRotation - this.cube.rotation.y ) * 0.05;
    }

    render() {
        this.composer.render(this.clock.getDelta());
        // this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Demo;