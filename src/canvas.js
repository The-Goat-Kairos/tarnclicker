let canvas, context, CANVAS_WIDTH, CANVAS_HEIGHT;

export function initializeCanvas(selectorId) {
    canvas = document.getElementById(selectorId);
    context = canvas.getContext('2d');
    CANVAS_WIDTH = canvas.clientWidth;
    CANVAS_HEIGHT = canvas.clientHeight;
    console.log(canvas, context, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function clearScreen() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawBackground(color) {
    if (!canvas) return;
    clearScreen();
    context.fillStyle = color;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.stroke();
}

export function drawCircle(x, y, radius, color) {
    if (!canvas) return;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
}
