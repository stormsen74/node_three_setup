/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
var meshline = require('three.meshline');
var OrbitControls = require('./../three/controls/OrbitControls')

import {Vector2} from '../math/vector2';
import mathUtils from '../utils/mathUtils';

const PI = Math.PI;
const HALF_PI = Math.PI * .5;
const TWO_PI = Math.PI * 2;

class CV3 {

    constructor() {

        console.log('CV3!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.vZero = new THREE.Vector3(0, 0, 0);
        this.vTarget = new THREE.Vector3(0, 0, 0);
        this.v3 = new THREE.Vector3(0, 0, 0);
        this.SPHERICAL = {
            phi: 0,
            theta: 0,
            radius: 200,
            stepPhi: .1,
            stepTheta: .01
        }
        this.GEOM = {
            count: 120,
        }
        this.waypoints = [];

        for (var i = 0; i <= this.GEOM.count; i++) {
            this.waypoints[i] =
            {
                t: i * .26,
                position: new THREE.Vector3()
            }
        }


        this.s = new THREE.Spherical();


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
        this.camera.position.y = 0;
        this.camera.position.z = 500;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: false,
            autoClear: true
        });
        // this.renderer.autoClear = false;
        this.renderer.setClearColor(0xc3c3c3, .1);

        // renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screen.appendChild(this.renderer.domElement);
        this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;


        this.scene = new THREE.Scene();


        this.initGeometry();
        this.initMeshLine();
        this.initListener();
        this.initDAT()

    }


    initDAT() {
        this.gui = new dat.GUI();

        this.gui.add(this.SPHERICAL, 'phi').min(0).max(TWO_PI).step(.01).name('phi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'theta').min(0).max(TWO_PI).step(.01).name('theta').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'radius').min(0).max(300).step(.01).name('radius').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepPhi').min(0.001).max(.100).step(.001).name('stepPhi').onChange(this.updateParams.bind(this));
        this.gui.add(this.SPHERICAL, 'stepTheta').min(0.001).max(.100).step(.001).name('stepTheta').onChange(this.updateParams.bind(this));
    }

    updateParams() {
        this.s.set(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s)
        this.setObjectPosition(this.cube, this.v3);
        this.cube.lookAt(this.vTarget)

        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;

        this.mesh_line.advance(this.v3)
    }


    setObjectPosition(o, v) {
        o.position.x = v.x;
        o.position.y = v.y;
        o.position.z = v.z;
    }

    initGeometry() {

        var geometry, material

        // centerSphere
        geometry = new THREE.SphereGeometry(this.SPHERICAL.radius, 16, 16);
        material = new THREE.MeshNormalMaterial({
            transparent: true, opacity: 0.2
        });
        this.centerSphere = new THREE.Mesh(geometry, material);
        // this.scene.add(this.centerSphere)

        // sphere
        geometry = new THREE.SphereGeometry(10, 10, 10);
        material = new THREE.MeshNormalMaterial();
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        geometry = new THREE.CubeGeometry(20, 20, 20, 5, 5, 5);
        material = new THREE.MeshNormalMaterial({
            wireframe: false
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);


        var line_material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
        });

        this.line_geom = new THREE.Geometry();
        this.line_geom.vertices[0] = this.vZero;
        this.line_geom.vertices[1] = this.v3;
        this.line = new THREE.Line(this.line_geom, line_material);
        //this.scene.add(this.line);

        //create a blue LineBasicMaterial
        this.draw_line_material = new THREE.LineBasicMaterial({
            color: 0x00ffcc,
        });
        this.draw_line_geometry = new THREE.Geometry();
        for (var i = 0; i < 30; i++) {
            this.draw_line_geometry.vertices.push(new THREE.Vector3(0, 100, 0))
        }
        this.draw_line = new THREE.Line(this.draw_line_geometry, this.draw_line_material);
        //this.scene.add(this.draw_line);


    }

    initMeshLine() {

        this.mesh_line_geometry = new THREE.Geometry();
        for (var i = 0; i < 30; i++) {
            this.mesh_line_geometry.vertices.push(new THREE.Vector3(0, 100, 0));
        }

        this.mesh_line = new meshline.MeshLine();
        this.mesh_line.setGeometry(this.mesh_line_geometry, function (p) {
            return 1 * Math.pow(4 * p * ( 1 - p ), 1)
        });

        var material = new meshline.MeshLineMaterial({
            color: new THREE.Color(0x00ccff),
            opacity: 1,
            resolution: this.resolution,
            sizeAttenuation: 1,
            lineWidth: 3,
            near: 1,
            far: 100000,
            depthTest: true,
            blending: THREE.AdditiveBlending,
            transparent: false,
            side: THREE.DoubleSide
        });

        var mesh = new THREE.Mesh(this.mesh_line.geometry, material); // this syntax could definitely be improved!
        this.scene.add(mesh);
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

        // this.SETTINGS.mouseXOnMouseDown = event.clientX - this.SETTINGS.centerX;
        // this.SETTINGS.targetRotationOnMouseDown = this.SETTINGS.targetRotation;
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
        //     this.SETTINGS.mouseX = event.clientX - this.SETTINGS.centerX;
        //     this.SETTINGS.targetRotation = this.SETTINGS.targetRotationOnMouseDown + ( this.SETTINGS.mouseX - this.SETTINGS.mouseXOnMouseDown ) * 0.02;
        // }
    }

    resize(_width, _height) {

        this.SETTINGS.centerX = _width / 2;
        this.SETTINGS.centerY = _width / 2;

        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();

        this.resolution.set(_width, _height);

    }

    // TODO GSAP-TEST!

    plotPoint(v, t) {
        var max = this.waypoints[this.waypoints.length - 1].t;
        var r = t < max * .5 ? mathUtils.convertToRange(t, [0, max * .5], [3, 20]) : mathUtils.convertToRange(t, [0, max], [20, 3])
        var geometry = new THREE.CubeGeometry(r, r, r, 5, 5, 5);
        var material = new THREE.MeshNormalMaterial({
            wireframe: false
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.setObjectPosition(mesh, v);
        mesh.lookAt(this.vTarget)
        this.scene.add(mesh);
    }


    update() {
        this.cube.rotation.y += ( this.SETTINGS.targetRotation - this.cube.rotation.y ) * 0.05;

        // return

        if (this.SPHERICAL.phi >= Math.PI * 2) {
            this.SPHERICAL.phi = 0;
            //this.theta += .1;
        }
        this.SPHERICAL.phi += this.SPHERICAL.stepPhi;
        this.SPHERICAL.theta += this.SPHERICAL.stepTheta;


        this.s = new THREE.Spherical(this.SPHERICAL.radius, this.SPHERICAL.phi, this.SPHERICAL.theta);
        this.v3.setFromSpherical(this.s);

        this.setObjectPosition(this.cube, this.v3);
        this.cube.lookAt(this.vTarget)


        for (var i = 0; i < this.waypoints.length; i++) {
            if (this.SPHERICAL.theta > this.waypoints[i].t && this.waypoints[i].position.x == 0) {
                this.waypoints[i].position.x = this.v3.x;
                this.waypoints[i].position.y = this.v3.y;
                this.waypoints[i].position.z = this.v3.z;

                // this.plotPoint(this.v3, this.SPHERICAL.theta);
            }
        }


        // var a = new THREE.Euler(0, this.step, 0, 'XYZ');
        // this.v3.applyEuler(a);


        this.line.geometry.vertices[1] = this.v3;
        this.line.geometry.verticesNeedUpdate = true;


        this.draw_line_geometry.vertices.pop()
        this.draw_line_geometry.vertices.unshift(this.v3.clone());
        this.draw_line.geometry.verticesNeedUpdate = true;

        this.mesh_line.advance(this.v3)

        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default CV3;