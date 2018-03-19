class MathUtils {

    constructor() {
        this.m = new Map([
            ['initial', {
                locationData: {
                    targetX: 0.13482722236583938,
                    targetY: 0.1548841882472296,
                    targetZ: 0.39605143627131145,
                    polarAngle: -1.3075782956578286,
                    azimuthAngle: 1.3595968206712132,
                    zoom: 3.674077220462012
                },
            }]
        ]);

        console.log(this.m.get('initial'));

    }


    static degToRad(deg) {
        return deg * 0.0174533;
    }
}

export default MathUtils;