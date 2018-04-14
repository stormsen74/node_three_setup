import * as THREE from 'three';

import CameraControls from './cameraControls';
import MathUtils from "./mathUtils";

var gsap = require('gsap');
var Mousetrap = require('mousetrap');


const degToRad = (deg) => {
    return deg * 0.0174533;
};

class SceneCameraController {

    constructor(_ratio, _domElement) {

        this.orbitalCam = new THREE.PerspectiveCamera(50, _ratio, 1, 1000);
        this.orbitalCam.position.y = .8;
        this.orbitalCam.position.x = -5.2;

        this.cameraControls = new CameraControls(this.orbitalCam, _domElement);
        this.tempTargetEnd = new THREE.Vector3();
        this.vTargetAnimation = new THREE.Vector3();
        this.cameraControls.saveState();

        this.camera = new THREE.PerspectiveCamera(50, _ratio, 1, 1000);
        this.vecCameraOffset = new THREE.Vector3();

        console.log(MathUtils.degToRad(75));

        this.currentState = null;
        this.camStates = {
            state_01: {
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0,
                polarAngle: 1.4181469983996315,
                azimuthAngle: 0,
                zoom: 5.261178575186363
            },
            state_02: {
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0,
                polarAngle: 1.4181469983996315,
                azimuthAngle: MathUtils.PI * .25,
                zoom: 5.261178575186363
            },
            state_03: {
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0,
                polarAngle: 1.1851474257851484,
                // azimuthAngle: MathUtils.HALF_PI,
                azimuthAngle: -MathUtils.PI + .35,
                zoom: 5.261178575186364
            }
        };

        Mousetrap.bind('shift+s', this.logCamPosition.bind(this));
        // Mousetrap.bind('shift+0', this.driveToState.bind(this, this.camStates.state_01));
        Mousetrap.bind('shift+1', this.driveToState.bind(this, this.camStates.state_01));
        Mousetrap.bind('shift+2', this.driveToState.bind(this, this.camStates.state_02));
        Mousetrap.bind('shift+3', this.driveToState.bind(this, this.camStates.state_03));

        Mousetrap.bind('d', this.addOffsetX.bind(this));
        Mousetrap.bind('a', this.subOffsetX.bind(this));
        Mousetrap.bind('w', this.addOffsetY.bind(this));
        Mousetrap.bind('s', this.subOffsetY.bind(this));


        Mousetrap.bind('t', this.trace.bind(this));

    }

    trace() {
        const a = this.cameraControls._spherical.theta % MathUtils.TWO_PI;
        let a_mapped = a <= 0 ? MathUtils.TWO_PI + a : a;

        console.log(MathUtils.radToDeg(a_mapped))
    }


    addOffsetX() {
        this.vecCameraOffset.x += .01;
    }

    subOffsetX() {
        this.vecCameraOffset.x -= .01;
    }

    addOffsetY() {
        this.vecCameraOffset.y += .01;
    }

    subOffsetY() {
        this.vecCameraOffset.y -= .01;
    }


    // log Camera Position
    logCamPosition() {
        // theta => polar angle
        // phi => azimuth angle
        console.log(
            "======== camera properties ======== \n" +
            "offsetX: " + this.vecCameraOffset.x + ", \n" +
            "offsetY: " + this.vecCameraOffset.y + ", \n" +
            "offsetZ: " + this.vecCameraOffset.z + ", \n" +
            "polarAngle: " + this.cameraControls._spherical.phi + ", \n" +
            "azimuthAngle: " + this.cameraControls._spherical.theta + ", \n" +
            "zoom: " + this.cameraControls._spherical.radius + " \n" +
            "======== camera properties ======== \n"
        );
    }


    moveTo(x, y, z, enableTransition) {
        this.cameraControls.moveTo(x, y, z, enableTransition)
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


    driveToState(targetState = this.camStates.state_01) {

        this.cameraControls._spherical.theta = this.cameraControls._spherical.theta % MathUtils.TWO_PI;
        this.cameraControls._sphericalEnd.theta = this.cameraControls._sphericalEnd.theta % MathUtils.TWO_PI;

        // copy current state =>
        let state = {
            offsetX: this.vecCameraOffset.x,
            offsetY: this.vecCameraOffset.y,
            offsetZ: this.vecCameraOffset.z,
            polarAngle: this.cameraControls._spherical.phi,
            azimuthAngle: this.cameraControls._spherical.theta,
            zoom: this.cameraControls._spherical.radius
        };


        let distance = targetState.azimuthAngle - state.azimuthAngle;
        console.log('distance:', MathUtils.radToDeg(state.azimuthAngle));

        // ——————————————————————————————————————————————————
        // SHORT ROTATION
        // ——————————————————————————————————————————————————

        this.cameraControls.easeDamping = 1;
        let shortAngle = 0;

        if (Math.abs(distance) > MathUtils.PI) {
            if (targetState.azimuthAngle > 0) {
                shortAngle = targetState.azimuthAngle - MathUtils.TWO_PI;
            } else {
                shortAngle = targetState.azimuthAngle + MathUtils.TWO_PI
            }
        } else {
            shortAngle = targetState.azimuthAngle;
        }


        // console.log('1=>', this.cameraControls._spherical.theta, shortAngle);

        if (MathUtils.isPositive(this.cameraControls._spherical.theta) !== MathUtils.isPositive(shortAngle)) {
            // console.log('diff!')

            // if > 2PI
            if ((Math.abs(this.cameraControls._spherical.theta) + Math.abs(shortAngle)) > MathUtils.TWO_PI) {
                // console.log('2=>', this.cameraControls._spherical.theta, shortAngle);

                if (MathUtils.isPositive(this.cameraControls._spherical.theta)) {
                    shortAngle = MathUtils.TWO_PI - shortAngle;
                    shortAngle = shortAngle % (MathUtils.TWO_PI);
                    // console.log('a', shortAngle)
                } else {
                    // FORCE LEFT (
                    shortAngle = this.cameraControls._spherical.theta - (MathUtils.TWO_PI - distance)
                    // console.log('b', shortAngle)
                }

            }
        }



        TweenMax.to(state, 2, {
            offsetX: targetState.offsetX,
            offsetY: targetState.offsetY,
            offsetZ: targetState.offsetZ,
            polarAngle: targetState.polarAngle,
            azimuthAngle: shortAngle,
            zoom: targetState.zoom,
            ease: Power2.easeInOut,
            onUpdate: () => {
                this.vecCameraOffset.x = state.offsetX;
                this.vecCameraOffset.y = state.offsetY;
                this.vecCameraOffset.z = state.offsetZ;

                this.cameraControls.rotateTo(
                    state.azimuthAngle,
                    state.polarAngle,
                    false
                );
                this.cameraControls.dollyTo(
                    state.zoom,
                    false
                );
            }
        })
    }


    // setFromState(state = this.camStates.initialState, transition = true) {
    //
    //     this.currentState = state;
    //
    //     this.cameraControls.moveTo(
    //         state.targetX,
    //         state.targetY,
    //         state.targetZ,
    //         transition
    //     );
    //     this.cameraControls.rotateTo(
    //         state.polarAngle,
    //         state.azimuthAngle,
    //         transition
    //     );
    //     this.cameraControls.dollyTo(
    //         state.zoom,
    //         transition
    //     )
    // }


    zoomTo(zoomlLevel = 10) {
        this.cameraControls.dollyTo(zoomlLevel, true)
    }

    startHover() {
        // TODO => Timeline

        // get a copy of targetEnd
        this.tempTargetEnd = this.cameraControls._targetEnd.clone();
        this.vTargetAnimation = this.tempTargetEnd.clone();

        TweenMax.to(this.vTargetAnimation, 1.5, {
            y: this.tempTargetEnd.y + .15,
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
        // console.log("rad: " + this.cameraControls._spherical.theta + "deg: " + MathUtils.radToDeg(this.cameraControls._spherical.theta));


        this.cameraControls.update();
        this.camera.position.copy(this.orbitalCam.position);
        this.camera.rotation.copy(this.orbitalCam.rotation);

        const camShift = new THREE.Vector3(this.vecCameraOffset.x, this.vecCameraOffset.y, this.vecCameraOffset.z);
        camShift.applyQuaternion(this.orbitalCam.quaternion);
        this.camera.position.add(camShift);

        // const cameraUp = new THREE.Vector3(0, 1, 0);
        // this.movingCam.rotateOnAxis(cameraUp, .1);
    }
}

// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SceneCameraController;