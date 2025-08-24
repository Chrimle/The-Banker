export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getNearestVerticalRotation(degrees = 0) {
    return Math.round((degrees - 90) / 180) * 180 + 90;
}

export function getNearestHorizontalRotation(degrees = 0) {
    return Math.round(degrees / 180) * 180;
}