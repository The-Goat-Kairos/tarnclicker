import { game, elements } from './gameState.js';

let canvas, context;

export function initializeCanvas(selectorId) {
    canvas = document.getElementById(selectorId);
    context = canvas.getContext('2d');
}

export function drawBackground(color) {
    console.log("Drew background");
}

export function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
}
