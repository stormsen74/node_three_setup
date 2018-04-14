class MathUtils {

    constructor() {

    }


    static degToRad(deg) {
        return deg * 0.0174533;
    }

    static radToDeg(rad) {
        return rad * 57.2958;
    }

    static isPositive(value) {
        return value > 0
    }

    static convertToRange(value, srcRange = [], dstRange = []) {

        return

        // if (value < srcRange[0] || value > srcRange[1]) return 0;
        if (value < srcRange[0]) return dstRange[0];
        if (value > srcRange[1]) return dstRange[1];

        let srcMax = srcRange[1] - srcRange[0], dstMax = dstRange[1] - dstRange[0], adjValue = value - srcRange[0];

        return (adjValue * dstMax / srcMax) + dstRange[0];
    }


}

MathUtils.PI = Math.PI;
MathUtils.TWO_PI = Math.PI * 2;
MathUtils.HALF_PI = Math.PI * .5;

export default MathUtils;