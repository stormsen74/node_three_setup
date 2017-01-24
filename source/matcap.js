/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
var OBJLoader = require('three-obj-loader')(THREE);
var OrbitControls = require('three-orbitcontrols')

import {Vector2} from './math/vector2';
import {suzanne} from './assets/suzanne-raw';

class Matcap {

    // https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader
    // https://github.com/spite/spherical-environment-mapping


    constructor() {


        console.log('Matcap!')

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
        this.camera.position.z = 100;

        this.scene = new THREE.Scene();


        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        this.initListener();

        // TODO load shader from glsl file ...
        var material = new THREE.ShaderMaterial({
            uniforms: {
                tMatCap: {type: 't', value: THREE.ImageUtils.loadTexture('source/assets/matcap3.jpg')},
            },
            vertexShader: document.getElementById('sem-vs').textContent,
            fragmentShader: document.getElementById('sem-fs').textContent,
            shading: THREE.SmoothShading

        });

        this.currentMaterial = material;
        this.LOADER = new THREE.OBJLoader()
        this.LOADER.load('source/assets/suzanne.obj', this.onLoad.bind(this));

        this.render();

    }


    createSuzanne() {
        // var geometry = new THREE.Geometry();
        // for (var j = 0; j < suzanne.vertices.length; j++) {
        //     var v = new THREE.Vector3(0, 0, 0);
        //     v.set(suzanne.vertices[j][0], suzanne.vertices[j][1], suzanne.vertices[j][2]);
        //     v.multiplyScalar(15);
        //     geometry.vertices.push(v);
        // }
        // for (var j = 0; j < suzanne.faces.length; j++) {
        //     var f = new THREE.Face3(suzanne.faces[j][0], suzanne.faces[j][1], suzanne.faces[j][2]);
        //     geometry.faces.push(f);
        //     var g = new THREE.Face3(suzanne.faces[j][2], suzanne.faces[j][2], suzanne.faces[j][3]);
        //     geometry.faces.push(g);
        // }
        //
        // geometry.verticesNeedUpdate = true;
        // geometry.normalsNeedUpdate = true;
        // geometry.uvsNeedUpdate = true;
        // // geometry.computeCentroids();
        // geometry.computeFaceNormals();
        // geometry.computeVertexNormals();
        // geometry.computeMorphNormals();
        // geometry.computeBoundingBox();
        // // var modifier = new THREE.SubdivisionModifier(2);
        // // modifier.modify(geometry);
        // return geometry;
    }

    onLoad(object) {
        // this.scene.add( object );
        console.log(object.children[0], this.camera)

        var normalMat = new THREE.MeshNormalMaterial();
        // if (this.mesh) this.scene.remove(this.mesh);
        this.mesh = new THREE.Mesh(object.children[0].geometry, this.currentMaterial);
        this.mesh.scale.x = 30;
        this.mesh.scale.y = 30;
        this.mesh.scale.z = 30;
        this.scene.add(this.mesh);
    }


    // switchMesh() {
    //     var normalMat = new THREE.MeshNormalMaterial();
    //     if (this.mesh) this.scene.remove(this.mesh);
    //     this.mesh = new THREE.Mesh(this.createSuzanne(), normalMat);
    // }


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
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Matcap;