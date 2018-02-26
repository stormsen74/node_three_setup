//#extension GL_OES_standard_derivatives : enable


// Created by inigo quilez - iq/2014
// Modified a little by Chris Brown
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.


// This is a procedural pattern that has 2 parameters, that generalizes cell-noise,
// perlin-noise and voronoi, all of which can be written in terms of the former as:
//
// cellnoise(x) = pattern(0,0,x)
// perlin(x) = pattern(0,1,x)
// voronoi(x) = pattern(1,0,x)
//
// From this generalization of the three famouse patterns, a new one (which I call
// "Voronoise") emerges naturally. It's like perlin noise a bit, but within a jittered
// grid like voronoi):
//
// voronoise(x) = pattern(1,1,x)
//
// Not sure what one would use this generalization for, because it's slightly slower
// than perlin or voronoise (and certainly much slower than cell noise), and in the
// end as a shading TD you just want one or another depending of the type of visual
// features you are looking for, I can't see a blending being needed in real life.
// But well, if only for the math fun it was worth trying. And they say a bit of
// mathturbation can be healthy anyway!


// cell noise   jitter=0,blur=0
// voronoi      jitter=1,blur=0
// perlin noise jitter=0,blur=1
// voronoise    jitter=1,blur=1

// More info here: http://iquilezles.org/www/articles/voronoise/voronoise.html




vec3 hash3( vec2 p ) {
    vec3 q = vec3(
    dot(p,vec2(127.1,311.7)),
    dot(p,vec2(269.5,183.3)),
    dot(p,vec2(419.2,371.9))
    );
    return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ) {
    vec2 p = floor(x);
    vec2 f = fract(x);

      float k = 1.0+63.0*pow(1.0-v,4.0);

      float va = 0.0;
      float wt = 0.0;
        for( int j=-2; j<=2; j++ )
        for( int i=-2; i<=2; i++ )
        {
            vec2 g = vec2( float(i),float(j) );
        vec3 o = hash3( p + g )*vec3(u,u,1.0);
        vec2 r = g - f + o.xy;
        float d = dot(r,r);
        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += o.z*ww;
        wt += ww;
        }

        return va/wt;
}



//https://www.shadertoy.com/view/XdXBRH

// The MIT License
// Copyright © 2017 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Computes the analytic derivatives of a 2D Gradient Noise


// Value    Noise 2D, Derivatives: https://www.shadertoy.com/view/4dXBRH
// Gradient Noise 2D, Derivatives: https://www.shadertoy.com/view/XdXBRH
// Value    Noise 3D, Derivatives: https://www.shadertoy.com/view/XsXfRH
// Gradient Noise 3D, Derivatives: https://www.shadertoy.com/view/4dffRH
// Value    Noise 2D             : https://www.shadertoy.com/view/lsf3WH
// Value    Noise 3D             : https://www.shadertoy.com/view/4sfGzS
// Gradient Noise 2D             : https://www.shadertoy.com/view/XdXGW8
// Gradient Noise 3D             : https://www.shadertoy.com/view/Xsl3Dl
// Simplex  Noise 2D             : https://www.shadertoy.com/view/Msf3WH


vec2 hash( in vec2 x )  // replace this by something better
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}


// return gradient noise (in x) and its derivatives (in yz)
vec3 noised( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

#if 1
    // quintic interpolation
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
#else
    // cubic interpolation
    vec2 u = f*f*(3.0-2.0*f);
    vec2 du = 6.0*f*(1.0-f);
#endif

    vec2 ga = hash( i + vec2(0.0,0.0) );
    vec2 gb = hash( i + vec2(1.0,0.0) );
    vec2 gc = hash( i + vec2(0.0,1.0) );
    vec2 gd = hash( i + vec2(1.0,1.0) );

    float va = dot( ga, f - vec2(0.0,0.0) );
    float vb = dot( gb, f - vec2(1.0,0.0) );
    float vc = dot( gc, f - vec2(0.0,1.0) );
    float vd = dot( gd, f - vec2(1.0,1.0) );

    return vec3( va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),   // value
                 ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) +  // derivatives
                 du * (u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
}



uniform float iGlobalTime;
uniform vec3  iResolution;
varying vec3 uvColor;
varying vec2 vUv;


void main() {

//----------------------------------
// uv - color
//----------------------------------

//    gl_FragColor = vec4(uvColor, 1.0);

//----------------------------------
// checkerboard
//----------------------------------

//    vec3 color1 = vec3(1.0);
//    vec3 color2 = vec3(0.0);
//
//    float scale = 1.0;
//
//    vec2 center = -1.0 + 2.0 * vUv;
//    vec2 uv = floor(center.xy * scale);
//
//    if(mod(uv.x + uv.y, 2.0) > 0.5){
//       gl_FragColor = vec4(color1*uvColor, 1.0);
//    }else{
//       gl_FragColor = vec4(color2, 1.0);
//     }

 //----------------------------------
 // voronoise
 //----------------------------------

    float amount = 5.0;
    float jitter = 1.0;
    float blur = 0.0;

//    vec2 p = 0.5 - 0.5*sin( vUv );
//
//     p = p*p*(3.0-2.0*p);
//     p = p*p*(3.0-2.0*p);
//     p = p*p*(3.0-2.0*p);

     amount+=5.0*sin(iGlobalTime)*.25*sin(iGlobalTime);
//     float j = 0.0 + abs(sin(iGlobalTime));
     float j = 1.0;
     float b = 1.0 - abs(sin(.25*iGlobalTime));
     vec2 o = vec2(0.0,0.0);
     o.x+=sin(iGlobalTime);
     o.y+=cos(iGlobalTime);
     float f = iqnoise( amount*vUv+o, j, b );

     vec3 rgb = vec3(.3,.5,.9);
     rgb*=f;


     gl_FragColor = vec4( rgb, 1.0);



 //----------------------------------
 // -
 //----------------------------------

//     vec2 p = (-iResolution.xy + 2.0*gl_FragColor)/iResolution.y;
     vec2 p = -1.0 + 2.0 * vUv;


         vec3 n = noised( 8.0 * p );

//         vec3 col = 0.5 + 0.5*((p.x>0.0) ? n.yzx : n.xxx);
//         vec3 col = 0.5 + n.yzx;
         vec3 col = 0.5 + n.xxx;

//     	gl_FragColor = vec4( col, 1.0 );


 }