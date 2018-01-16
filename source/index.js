// /**
//  * Created by STORMSEN on 29.11.2016.
//  */

var raf = require('raf');
import Demo from './demos/demo';
import Matcap from './demos/matcap';
import CV3 from './demos/checkVector3';
import SphericalLight from './demos/sphericalLight';

// https://github.com/josdirksen
// https://github.com/Jam3/three-path-geometry
// https://github.com/spite/THREE.MeshLine
// https://github.com/mattdesl/three-line-2d


const init = () => {

    const demo = new Demo();

    const update = () => {
        raf(update);
        demo.update();
        demo.render();
    };
    const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        demo.resize(width, height)
    };
    window.addEventListener('resize', resize);
    resize();
    update();
};


if (document.readyState === 'complete') init()
else window.addEventListener('load', init);
