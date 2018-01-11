/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
//var EffectComposer = require('three-effectcomposer')(THREE)
//var POSTPROCESSING = require('postprocessing');
import { EffectComposer, GlitchPass, BokehPass, DotScreenPass, GodRaysPass, RenderPass } from "postprocessing";

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
            targetRotation: {x: 0, y: 0},
            targetRotationOnMouseDown: {x: 0, y: 0},
            tapLocation: {x: 0, y: 0},
            pointer: {x: 0, y: 0}
        }

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 150;
        this.camera.position.z = 500;

        this.pointLight = new THREE.PointLight(0xa8d1e2);

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.initGeometry();
        // this.initLights();
        this.initComposer();
        this.initListener();

    }

    initComposer() {

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        //this.passes = {
        //    glitchPass: new POSTPROCESSING.GlitchPass()
        //}

        this.pass = new DotScreenPass();
        this.pass.renderToScreen = true;

        this.pass_gR = new GodRaysPass(this.scene, this.camera, this.pointLight);
        this.pass_gR.renderToScreen = true;

        this.pass_bokeh = new BokehPass(this.camera);
        this.pass_bokeh.renderToScreen = true;

        this.composer.addPass(this.pass_bokeh);
        // this.composer.addPass(this.pass);
        //console.log(this.composer.passes[1]['bokehMaterial']['uniforms']['focus'].value)

    }

    initGeometry() {

        var geometry = new THREE.BoxGeometry(200, 200, 200);
        var material = new THREE.MeshNormalMaterial();
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.y = 150;
        this.scene.add(this.cube)

    }

    initLights() {

        this.pointLight.position.set(0, 300, 100);

        //this.spotLight.castShadow = true;

        this.lightHelper = new THREE.PointLightHelper(this.pointLight);

        var targetObject = new THREE.Object3D();

        //this.camera.lookAt(new THREE.Vector3(0, targetObject.position.y, 0));
        //this.controls.target.set(0, targetObject.position.y, 0);
        //this.spotLight.target = targetObject;


        this.scene.add(this.pointLight);
        this.scene.add(this.lightHelper);
        //this.scene.add(targetObject);


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
            this.SETTINGS.targetRotation.y = this.SETTINGS.targetRotationOnMouseDown.y + ( this.SETTINGS.pointer.x - this.SETTINGS.tapLocation.x ) * 0.02;
            this.SETTINGS.targetRotation.x = this.SETTINGS.targetRotationOnMouseDown.x + ( this.SETTINGS.pointer.y - this.SETTINGS.tapLocation.y ) * 0.02;
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
        this.cube.rotation.y += ( this.SETTINGS.targetRotation.y - this.cube.rotation.y ) * 0.05;
        this.cube.rotation.x += ( this.SETTINGS.targetRotation.x - this.cube.rotation.x ) * 0.05;
        let f = (this.SETTINGS.targetRotation.x - this.cube.rotation.x) * .5;
        this.composer.passes[1]['bokehMaterial']['uniforms']['focus'].value = Math.abs(f);
    }

    render() {
        this.composer.render(this.clock.getDelta());
        //this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Demo;