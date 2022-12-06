const TWO_PI = Math.PI * 2
const QUARTER_TURN = Math.PI / 2;

function normalizeAngle(angle) {
    if (angle < 0) {
        return TWO_PI - (Math.abs(angle) % TWO_PI);
    }
    return angle % TWO_PI;
}

function radToDegrees(rad) {
    return rad * 180 / Math.PI;
}

function cartesianToLatLng([x, y, z]) {
    const radius = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return [
        radius,
        (Math.PI / 2) - Math.acos(y / radius),
        normalizeAngle(Math.atan2(x, -z)),
    ];
}

function latLngToCartesian([radius, lat, lng]) {
    lng = -lng + Math.PI / 2;
    return [
        radius * Math.cos(lat) * Math.cos(lng),
        radius * Math.sin(lat),
        radius * -Math.cos(lat) * Math.sin(lng),
    ];
}

function clamp(value, low, high) {
    low = low !== undefined ? low : Number.MIN_SAFE_INTEGER;
    high = high !== undefined ? high : Number.MAX_SAFE_INTEGER;
    if (value < low) {
        value = low;
    }
    if (value > high) {
        value = high;
    }
    return value;
}

function lerp(start, end, normalValue) {
    return start + (end - start) * normalValue;
}

function inverseLerp(start, end, value) {
    return (value - start) / (end - start);
}

function normalizeNumber(num, len) {
    num = parseFloat(num.toFixed(len));
    num = num === -0 ? 0 : num;
    return num;
}

function sphere_way2(rings, segments, radius, baseColor) {
    let vertexPositionData = [];
    let normalData = [];
    let textureVertexData = [];
    let colorData = [];

    for (let ringsNumber = 0; ringsNumber <= rings; ringsNumber++) {
        let theta = ringsNumber * Math.PI / rings;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let segmentsNumber = 0; segmentsNumber <= segments; segmentsNumber++) {
            let phi = segmentsNumber * 2 * Math.PI / segments;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;
            let u = 1 - (segmentsNumber / segments);
            let v = 1 - (ringsNumber / rings);

            normalData.push(vec3(x, y, z));

            textureVertexData.push(vec2(u, v));

            vertexPositionData.push(vec4(radius * x, radius * y, radius * z, 1.0));

            colorData.push(baseColor[0]);
            colorData.push(baseColor[1]);
            colorData.push(baseColor[2]);
            colorData.push(baseColor[3]);
        }
    }
    let indexData = [];
    for (let ringsNumber = 0; ringsNumber < rings; ringsNumber++) {
        for (let segmentsNumber = 0; segmentsNumber < segments; segmentsNumber++) {
            let first = (ringsNumber * (segments + 1)) + segmentsNumber;
            let second = first + segments + 1;

            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    let positions = indexData.map((index) => vertexPositionData[index]);
    let texture = indexData.map((index) => textureVertexData[index]);

    return {
        // vertices: vertexPositionData,
        normals: normalData,
        textureCoords: texture,
        colors: colorData,
        // indexes: indexData,
        positions: positions,
    }
}

function sphere_way1(density) {
    const radsPerUnit = Math.PI / density;
    const sliceVertCount = density * 2;


    const points = [];
    const uvs = []

    let latitude = -Math.PI / 2;
    //latitude
    for (let i = 0; i <= density; i++) {
        if (i === 0 || i === density) { //polar caps
            points.push(vec4(...latLngToCartesian([1, latitude, 0]), 1.0));
            uvs.push(vec2(0.5, latitude > 0 ? 1 : 0));
        } else {
            let longitude = 0;
            for (let j = 0; j < sliceVertCount; j++) {
                points.push(vec4(...latLngToCartesian([1, latitude, longitude]), 1.0));
                uvs.push(vec2(inverseLerp(0, TWO_PI, longitude), inverseLerp(-QUARTER_TURN, QUARTER_TURN, -latitude)))
                longitude += radsPerUnit;
            }
        }
        latitude += radsPerUnit;
    }


    const triangles = [];
    for (let ring = 0; ring < density - 1; ring++) { // start at first ring
        const initialP = (ring * sliceVertCount) + 1;
        for (let sliceVert = 0; sliceVert < sliceVertCount; sliceVert++) {
            const thisP = initialP + sliceVert;
            const nextP = initialP + ((sliceVert + 1) % sliceVertCount);
            if (ring === 0) {
                triangles.push([0, nextP, thisP]);
            }
            if (ring === density - 2) {
                triangles.push([thisP, nextP, points.length - 1])
            }
            if (ring < density - 2 && density > 2) {
                triangles.push([thisP, nextP + sliceVertCount, thisP + sliceVertCount])
                triangles.push([thisP, nextP, nextP + sliceVertCount])
            }
        }
    }

    const positions = []

    for (let t of triangles) {
        positions.push(points[t[0]]);
        positions.push(points[t[1]]);
        positions.push(points[t[2]]);
    }

    return {
        points,
        triangles,
        positions,
        uvs
    }
}