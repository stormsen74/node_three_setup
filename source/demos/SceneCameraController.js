import * as THREE from 'three';

import CameraControls from './cameraControls';

var gsap = require('gsap');
var Mousetrap = require('mousetrap');


const degToRad = (deg) => {
    return deg * 0.0174533;
}

class SceneCameraController {

    constructor(_camera, _domElement) {

        this.cameraControls = new CameraControls(_camera, _domElement);
        this.tempTargetEnd = new THREE.Vector3();
        this.vTargetAnimation = new THREE.Vector3();

        this.currentState = null;

        this.camStates = {
            initialState: {
                targetX: -0.23069918100501305,
                targetY: 0.5314676318709793,
                targetZ: -0.5155496456930395,
                polarAngle: -1.0529244128047037,
                azimuthAngle: 1.4915573429506437,
                zoom: 6.1363797348725635
            },
            state_01: {
                targetX: 0.13482722236583938,
                targetY: 0.1548841882472296,
                targetZ: 0.1548841882472296,
                polarAngle: -2.3728381467142436,
                azimuthAngle: 1.3437570290929228,
                zoom: 5.7890149871255785
            },
            state_02: {
                targetX: 0.13482722236583938,
                targetY: 0.1548841882472296,
                targetZ: 0.1548841882472296,
                polarAngle: -1.92381973288244,
                azimuthAngle: 1.1272773639351614,
                zoom: 16.261616938713104
            },
            state_03: {
                targetX: 0.13482722236583938,
                targetY: 0.1548841882472296,
                targetZ: 0.1548841882472296,
                polarAngle: -1.2264190855131918,
                azimuthAngle: 1.1272773639351616,
                zoom: 16.261616938713104
            }
        };


        Mousetrap.bind('shift+s', this.logCamPosition.bind(this));
        Mousetrap.bind('shift+0', this.setFromState.bind(this, this.camStates.initialState, true));
        Mousetrap.bind('shift+1', this.setFromState.bind(this, this.camStates.state_01, true));
        Mousetrap.bind('shift+2', this.setFromState.bind(this, this.camStates.state_02, false));
        Mousetrap.bind('shift+3', this.setFromState.bind(this, this.camStates.state_03, true));

    }

    // log Camera Position
    logCamPosition() {
        // theta => polar angle
        // phi => azimuth angle
        console.log(
            "======== camera properties ======== \n" +
            "targetX: " + this.cameraControls._targetEnd.x + ", \n" +
            "targetY: " + this.cameraControls._targetEnd.y + ", \n" +
            "targetZ: " + this.cameraControls._targetEnd.z + ", \n" +
            "polarAngle: " + this.cameraControls._spherical.theta + ", \n" +
            "azimuthAngle: " + this.cameraControls._spherical.phi + ", \n" +
            "zoom: " + this.cameraControls._spherical.radius + " \n" +
            "======== camera properties ======== \n"
        );
    }


    // TODO
    // refine state Objects
    // shortcut copy cam position
    // shortcuts goto Position
    // add cam-lock (+-value)
    // tween cam (gsap) ...
    // events => hammer.js
    // debug camera
    // camera helper


    driveToState(targetState = this.camStates.initialState) {

        // let state = Object.assign({}, this.currentState);

        // copy current state =>
        let state = {
            targetX: this.cameraControls._targetEnd.x,
            targetY: this.cameraControls._targetEnd.y,
            targetZ: this.cameraControls._targetEnd.z,
            polarAngle: this.cameraControls._spherical.theta,
            azimuthAngle: this.cameraControls._spherical.phi,
            zoom: this.cameraControls._spherical.radius
        };

        TweenMax.to(state, 2, {
            targetX: targetState.targetX,
            targetY: targetState.targetY,
            targetZ: targetState.targetZ,
            polarAngle: targetState.polarAngle,
            azimuthAngle: targetState.azimuthAngle,
            zoom: targetState.zoom,
            ease: Power2.easeInOut,
            onUpdate: () => {
                this.cameraControls.moveTo(
                    state.targetX,
                    state.targetY,
                    state.targetZ,
                    false
                );
                this.cameraControls.rotateTo(
                    state.polarAngle,
                    state.azimuthAngle,
                    false
                );
                this.cameraControls.dollyTo(
                    state.zoom,
                    false
                );
            }
        })
    }


    setFromState(state = this.camStates.initialState, transition = true) {

        this.currentState = state;

        this.cameraControls.moveTo(
            state.targetX,
            state.targetY,
            state.targetZ,
            transition
        );
        this.cameraControls.rotateTo(
            state.polarAngle,
            state.azimuthAngle,
            transition
        );
        this.cameraControls.dollyTo(
            state.zoom,
            transition
        )
    }


    zoomTo(zoomlLevel = 10) {
        this.cameraControls.dollyTo(zoomlLevel, true)
    }


    startHover() {
        // TODO => Timeline

        // get a copy of targetEnd
        this.tempTargetEnd = this.cameraControls._targetEnd.clone();
        this.vTargetAnimation = this.tempTargetEnd.clone();

        TweenMax.to(this.vTargetAnimation, 2, {
            y: this.tempTargetEnd.y + .25,
            ease: Sine.easeInOut,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                this.cameraControls.moveTo(
                    this.vTargetAnimation.x,
                    this.vTargetAnimation.y,
                    this.vTargetAnimation.z,
                    false
                )
            }
        })

    }

    stopHover() {
        TweenMax.killTweensOf(this.vTargetAnimation)
        TweenMax.to(this.vTargetAnimation, .5, {
            y: this.tempTargetEnd.y,
            ease: Sine.easeInOut,
            onUpdate: () => {
                this.cameraControls.moveTo(
                    this.vTargetAnimation.x,
                    this.vTargetAnimation.y,
                    this.vTargetAnimation.z,
                    false
                )
            }
        })

    }

    update() {
        this.cameraControls.update();
    }
}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SceneCameraController;
