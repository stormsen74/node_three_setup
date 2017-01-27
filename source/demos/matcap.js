/**
 * Created by STORMSEN on 01.12.2016.
 */

// Based on ...
// https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader
// https://github.com/spite/spherical-environment-mapping
//     +
// https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js

var THREE = require('three');
var gsap = require('gsap')
var OBJLoader = require('three-obj-loader')(THREE);
var ShaderLoader = require('./../three/ShaderLoader')
var OrbitControls = require('./../three/controls/OrbitControls')
var SubdivisionModifier = require('./../three/modifiers/SubdivisionModifier');
var BufferSubdivisionModifier = require('./../three/modifiers/BufferSubdivisionModifier');

var SimplexNoise = require('simplex-noise')

import {Vector2} from '../math/vector2';


// https://github.com/mrdoob/three.js/blob/dev/examples/js/modifiers/BufferSubdivisionModifier.js

class Matcap {


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


        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
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

        this.SCENE_MATERIALS = {
            normalMaterial: new THREE.MeshNormalMaterial({
                shading: THREE.FlatShading
            }),
            wireFrameMaterial: new THREE.MeshLambertMaterial({
                color: 0x565656,
                wireframe: true
            }),
            loadedShaderMaterial: null
        }

        this.start = Date.now();


        this.LOADER = new THREE.OBJLoader()
        // this.LOADER.load('source/assets/suzanne.obj', this.onLoad.bind(this));

        // this.SHADER_LOADER = new ShaderLoader('source/shader/sem_vs.glsl', 'source/shader/sem_fs.glsl', this.onLoadShader.bind(this));
        this.SHADER_LOADER = new ShaderLoader('source/shader/vdisp_vs.glsl', 'source/shader/vdisp_fs.glsl', this.onLoadVDisp.bind(this));


        this.render();

    }

    onLoadVDisp(vertex_text, fragment_text) {
        var loadedShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture('source/assets/v-o.png')
                },
                time: { // float initialized to 0
                    type: "f",
                    value: 0.0
                }
            },
            vertexShader: vertex_text,
            fragmentShader: fragment_text,
            shading: THREE.SmoothShading
        });

        this.SCENE_MATERIALS.loadedShaderMaterial = loadedShaderMaterial;

        this.makeSphere();

    }

    onLoadShader(vertex_text, fragment_text) {

        var loadedShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tMatCap: {type: 't', value: THREE.ImageUtils.loadTexture('source/assets/ANGMAP11.jpg')},
            },
            vertexShader: vertex_text,
            fragmentShader: fragment_text,
            shading: THREE.SmoothShading
        });

        this.SCENE_MATERIALS.loadedShaderMaterial = loadedShaderMaterial

        this.makeBlob();

    }


    onLoad(object) {

        this.geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);
        // this.geometry = object.children[0].geometry;
        // var smooth = THREE.GeometryUtils.clone( this.geometry );
        this.geometry.computeVertexNormals();
        this.geometry.mergeVertices();

        var modifier = new SubdivisionModifier(2); // Number of subdivisions
        modifier.modify(this.geometry);

        this.mesh = new THREE.Mesh(this.geometry, this.SCENE_MATERIALS.normalMaterial);
        this.mesh.scale.x = 35;
        this.mesh.scale.y = 35;
        this.mesh.scale.z = 35;
        this.mesh.rotateX(-Math.PI * .3);
        this.scene.add(this.mesh);

    }

    makeSphere() {
        this.sphereGeom = new THREE.IcosahedronGeometry(20, 5);
        this.sphereMesh = new THREE.Mesh(this.sphereGeom, this.SCENE_MATERIALS.loadedShaderMaterial);
        this.sphereMesh.scale.x = this.sphereMesh.scale.y = this.sphereMesh.scale.z = 2.5;
        this.scene.add(this.sphereMesh);
    }

    makeBlob() {
        this.SIMPLEX = new SimplexNoise();
        this.blobGeom = this.createBlob();
        this.blobMesh = new THREE.Mesh(this.blobGeom, this.SCENE_MATERIALS.normalMaterial);
        this.blobMesh.scale.x = this.blobMesh.scale.y = this.blobMesh.scale.z = 3;
        this.scene.add(this.blobMesh);

        TweenLite.delayedCall(3, this.switchBlobMaterial.bind(this))
    }

    switchBlobMaterial() {
        this.blobMesh.material = this.SCENE_MATERIALS.loadedShaderMaterial;
    }


    // Perlin Noise functions from Procedurally Bump-Textured Sphere http://mrl.nyu.edu/~perlin/homepage2006/bumpy/index.html

    stripes(x, f) {
        var t = .5 + .5 * Math.sin(f * 2 * Math.PI * x);
        return t * t - .5;
    }


    turbulence(x, y, z) {
        var t = -.5;
        var W = 60;
        for (var f = 1; f <= W / 12; f *= 2) {
            t += Math.abs(this.SIMPLEX.noise3D(f * x, f * y, f * z) / f);
        }
        return t;
    }


    crinkly(x, y, z) {
        return -.1 * this.turbulence(x, y, z);
    }


    lumpy(x, y, z) {
        return .03 * this.SIMPLEX.noise3D(8 * x, 8 * y, 8 * z);
    }


    marbled(x, y, z) {
        return .01 * this.stripes(x + 2 * this.turbulence(x, y, z), 1.6);
    }


    createBlob() {
        var geometry = new THREE.IcosahedronGeometry(10, 5);
        var n = new THREE.Vector3(0, 0, 0);
        for (var j = 0; j < geometry.vertices.length; j++) {
            var v = geometry.vertices[j];
            n.copy(v);
            n.normalize();
            var d = 10 + 3 * this.SIMPLEX.noise3D(.1 * v.x, .1 * v.y, .1 * v.z) + 5 * this.crinkly(.25 * v.x, .25 * v.y, .25 * v.z);
            n.multiplyScalar(d);
            v.copy(n);
        }

        geometry.verticesNeedUpdate = true;
        geometry.normalsNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
        //geometry.computeCentroids();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeMorphNormals();
        // geometry.computeTangents();
        return geometry;
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
        if (this.SCENE_MATERIALS.loadedShaderMaterial) {
            this.SCENE_MATERIALS.loadedShaderMaterial.uniforms['time'].value = .00025 * ( Date.now() - this.start );
        }
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Matcap;