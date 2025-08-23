export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getNearestVerticalRotation(degrees) {
    if (degrees >= 0) {
        if (degrees % 360 >= 180) {
            return Math.floor(degrees / 360) * 360 + 270;
        } else {
            return Math.floor(degrees / 360) * 360 + 90;
        }
    }
    if (degrees % 360 >= -180) {
        return Math.floor(degrees / 360) * 360 + 270;
    } else {
        return Math.floor(degrees / 360) * 360 + 90;
    }
}