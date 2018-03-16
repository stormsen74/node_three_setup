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

        this.camStates = {
            initialState: {
                targetX: 0.13482722236583938,
                targetY: 0.1548841882472296,
                targetZ: 0.39605143627131145,
                polarAngle: -1.3075782956578286,
                azimuthAngle: 1.3595968206712132,
                zoom: 3.674077220462012
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
            }
        };


        Mousetrap.bind('shift+s', this.logCamPosition.bind(this));
        Mousetrap.bind('shift+1', this.setFromState.bind(this, this.camStates.state_01));
        Mousetrap.bind('shift+2', this.setFromState.bind(this, this.camStates.state_02));

        // TweenMax.delayedCall(1.5, this.startHover, null, this);

    }

        // log Camera Position
    logCamPosition() {
        console.log(
            "======== camera properties ======== \n" +
            "targetX: " + this.cameraControls._targetEnd.x + ", \n" +
            "targetY: " + this.cameraControls._targetEnd.y + ", \n" +
            "targetZ: " + this.cameraControls._targetEnd.y + ", \n" +
            "polarAngle: " + this.cameraControls._spherical.theta + ", \n" +
            "azimuthAngle: " + this.cameraControls._spherical.phi + ", \n" +
            "zoom: " + this.cameraControls._spherical.radius + " \n" +
            "======== camera properties ======== \n"
        );
    }

    // x: 0.13482722236583938, y: 0.1548841882472296, z: 0.39605143627131145} Spherical {radius: 3.674077220462012, phi: 1.3595968206712132, theta: -1.3075782956578286}
    // phi => polar angle
    // theta => azimut angle

    // TODO
    // refine state Objects
    // shortcut copy cam position
    // shortcuts goto Position
    // tween cam (gsap) ...
    // events => hammer.js
    // debug camera
    // camera helper


    setFromState(state = this.camStates.initialState) {

        console.log('setFromState', state);

        this.cameraControls.moveTo(
            state.targetX,
            state.targetY,
            state.targetZ,
            true
        );
        this.cameraControls.rotateTo(
            state.polarAngle,
            state.azimuthAngle,
            true
        );
        this.cameraControls.dollyTo(
            state.zoom,
            true
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
