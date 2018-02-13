/**
 * Created by STORMSEN on 01.12.2016.
 */

var THREE = require('three');
var OrbitControls = require('./../three/controls/OrbitControls')

const PI = Math.PI;
const HALF_PI = Math.PI * .5;
const TWO_PI = Math.PI * 2;

class Flow3 {

    constructor() {

        console.log('Flow3!')

        this.screen = document.getElementById('screen');
        document.body.appendChild(this.screen);

        this.vZero = new THREE.Vector3(0, 0, 0);
        this.vTarget = new THREE.Vector3(0, 0, 0);
        this.v3 = new THREE.Vector3(0, 1, 0);
        this.arrow = new THREE.ArrowHelper(this.v3, this.vZero);
        this.arrows = []
        this.raycaster = new THREE.Raycaster();
        this.objects = [];
        this.intersectPoint = new THREE.Vector3();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);


        this.vMouse = new THREE.Vector2();
        this.vMouse.pressed = false;

        this.SETTINGS = {
            centerX: 0,
            centerY: 0,
            gridResolution: 3,
            targetRotationOnMouseDown: 0,
            mouseXOnMouseDown: 0,
            mouseX: 0
        }

        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.y = 0;
        this.camera.position.z = 35;

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


        // var gridHelper = new THREE.GridHelper( 100, 50 );
        // this.objects.push(gridHelper)
        // this.scene.add( gridHelper );

        var plane_geometry = new THREE.PlaneGeometry( 100, 100, 1 );
        var plane_material = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity: .1, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( plane_geometry, plane_material );
        plane.rotateX(Math.PI*.5)
        this.objects.push(plane)
        this.scene.add( plane );

        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var geo = new THREE.EdgesGeometry(geometry);
        var mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1, transparent: true, opacity: .25});
        var wireframe = new THREE.LineSegments(geo, mat);
        this.scene.add(wireframe);


        this.initArrows();
        this.initListener();
        this.initDAT()

    }


    initArrows() {
        var length = 1;
        var hex = 0xffff00;
        for (var _x = 0; _x < this.SETTINGS.gridResolution; _x++) {
            for (var _y = 0; _y < this.SETTINGS.gridResolution; _y++) {
                for (var _z = 0; _z < this.SETTINGS.gridResolution; _z++) {
                    let offset = 10 / this.SETTINGS.gridResolution * .5;
                    let mX = THREE.Math.mapLinear(_x, 0, this.SETTINGS.gridResolution, -5, 5) + offset;
                    let mY = THREE.Math.mapLinear(_y, 0, this.SETTINGS.gridResolution, -5, 5) + offset * .5;
                    let mZ = THREE.Math.mapLinear(_z, 0, this.SETTINGS.gridResolution, -5, 5) + offset;
                    let arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(mX, mY, mZ), length, hex);
                    this.scene.add(arrow);
                    this.arrows.push(arrow)
                }
            }
        }

    }


    initDAT() {
        this.gui = new dat.GUI();
    }

    updateParams() {

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

        event.preventDefault();
        // if (this.vMouse.pressed) {
        this.vMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.vMouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        //     this.SETTINGS.targetRotation = this.SETTINGS.targetRotationOnMouseDown + ( this.SETTINGS.mouseX - this.SETTINGS.mouseXOnMouseDown ) * 0.02;
        // }

        this.raycaster.setFromCamera( this.vMouse, this.camera );
        var intersects = this.raycaster.intersectObjects( this.objects );
        if ( intersects.length > 0 ) {
            var intersect = intersects[ 0 ];
            console.log('intersect',intersect.point)
            this.intersectPoint = intersect.point
            // rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            // rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        }
        // this.render();
    }

    resize(_width, _height) {

        this.SETTINGS.centerX = _width / 2;
        this.SETTINGS.centerY = _width / 2;

        this.renderer.setSize(_width, _height);
        this.camera.aspect = _width / _height;
        this.camera.updateProjectionMatrix();

        this.resolution.set(_width, _height);

    }


    update() {

        this.controls.update();

        this.arrows.forEach((a, i)=> {
           a.setDirection(this.intersectPoint)
        })

    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }


}


// ——————————————————————————————————————————————————
// Exports
// ——————————————————————————————————————————————————

export default Flow3;