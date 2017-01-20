// /**
//  * Created by STORMSEN on 29.11.2016.
//  */

var raf = require('raf');
import Demo from './demo';
import CV3 from './checkVector3';



const init = () => {
    const demo = new CV3();
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
