import * as THREE from 'three';

import CameraControls from "../three/controls/camera-controls";

var gsap = require('gsap');

class SceneCameraController {

    constructor(_camera, _domElement) {
        this.clock = new THREE.Clock();
        this.cameraControls = new CameraControls(_camera, _domElement);


        this.tempTargetEnd = new THREE.Vector3();
        this.vTargetAnimation = new THREE.Vector3();


        TweenMax.delayedCall(.5, this.doOne, null, this);

        // TweenMax.delayedCall(1.5, this.startHover, null, this);
    }

    degToRad(deg) {
        return deg * THREE.Math.DEG2RAD;
    }

    doOne() {
        console.log(this.cameraControls)
        this.cameraControls.rotate(
            this.degToRad(-45),
            this.degToRad(0),
            true
        )

        TweenMax.delayedCall(1, this.doTwo, null, this);
    }

    doTwo() {
        console.log(this.cameraControls)
        this.cameraControls.rotateTo(
            this.degToRad(-75),
            this.degToRad(90),
            true
        )
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
        this.needsUpdate = this.clock.getDelta();
        this.cameraControls.update(this.needsUpdate);
    }
}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default SceneCameraController;
