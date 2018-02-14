/**
 * Created by STORMSEN on 01.12.2016.
 */

// Based on ...
// https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader
// https://github.com/spite/spherical-environment-mapping
//     +
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js

var THREE = require('three');
var gsap = require('gsap');
var OBJLoader = require('three-obj-loader')(THREE);
var glslify = require('glslify');
var ShaderLoader = require('./../three/ShaderLoader');
var OrbitControls = require('./../three/controls/OrbitControls');
var SubdivisionModifier = require('./../three/modifiers/SubdivisionModifier');
var BufferSubdivisionModifier = require('./../three/modifiers/BufferSubdivisionModifier');

var SimplexNoise = require('simplex-noise');

import {Vector2} from "../math/vector2";


// https://github.com/mrdoob/three.js/blob/dev/examples/js/modifiers/BufferSubdivisionModifier.js

class ShaderCheck {


    constructor() {

        console.log('ShaderCheck!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.clock = new THREE.Clock(true);
        this.textureLoader = new THREE.TextureLoader();
        this.objLoader = new THREE.OBJLoader();

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
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {type: 'f', value: 0.0}
            }
        });

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setClearColor(0xc3c3c3, .5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;

        this.initListener();

        this.tex_1 = this.textureLoader.load('source/assets/dust.png');
        this.tex_2 = this.textureLoader.load('source/assets/baboon.png');


        //here we create a custom shader with glslify
        //note USE_MAP is needed to get a 'uv' attribute
        this.mat = new THREE.ShaderMaterial({
            vertexShader: glslify('../shader/glslify/vert.glsl'),
            fragmentShader: glslify('../shader/glslify/noise_frag.glsl'),
            uniforms: {
                iChannel0: {type: 't', value: this.tex_1},
                iChannel1: {type: 't', value: this.tex_2},
                iGlobalTime: {type: 'f', value: 0}
            },
            transparent: true,
            defines: {
                USE_MAP: ''
            }
        });

        // const geo = new THREE.IcosahedronGeometry(50, 1)
        const geo = new THREE.BoxGeometry(100, 100, 100)
        this.mesh = new THREE.Mesh(geo, this.mat)
        this.scene.add(this.mesh);

        // this.objLoader.load('source/assets/suzanne.obj', this.onLoad.bind(this));


    }



    onLoad(object) {

        const geo = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);

            // var modifier = new SubdivisionModifier(1);
            // modifier.modify(geo);

        geo.computeVertexNormals();
        geo.mergeVertices();


        const material = new THREE.MeshBasicMaterial({color: '#cccc00', wireframe: true});

        // this.mesh = new THREE.Mesh(this.geometry, this.SCENE_MATERIALS.normalMaterial);
        this.mesh = new THREE.Mesh(geo, this.mat);
        this.mesh.scale.x = 35;
        this.mesh.scale.y = 35;
        this.mesh.scale.z = 35;
        this.mesh.rotateX(-Math.PI * .3);
        this.scene.add(this.mesh);

        // var shaderLoader = new ShaderLoader(
        //     'source/shader/shaderCheck/vert.glsl',
        //     'source/shader/shaderCheck/frag.glsl',
        //     shaderReady.bind(this)
        // );
        //
        // function shaderReady(vertex_text, fragment_text) {
        //     this.shaderMaterial = new THREE.ShaderMaterial({
        //         uniforms: {
        //             time: {type: 'f', value: 0.0}
        //         },
        //         vertexShader: vertex_text,
        //         fragmentShader: fragment_text
        //     });
        //
        //     this.shaderMaterial.flatShading = false;
        //     this.shaderMaterial.uniforms.time.needsUpdate = true;
        //
        //     this.mesh.material = this.shaderMaterial

        // }

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
        this.mat.uniforms.iGlobalTime.value = this.clock.getElapsedTime()
        // this.shaderMaterial.uniforms.time.value = this.clock.getElapsedTime();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default ShaderCheck;