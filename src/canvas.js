import {buildRenderableTree, computeNodePositions} from "./upgradesTree.js";
import {game} from "./gameState.js";

export const canvas = {};
export const viewState = {
    camera: {x: 0, y: 0, zoom: 1},
    selectedUpgradeId: null,
    hoveredUpgradeId: null,
    nodes: [],
    edges: [],
};
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

let treeDirty = true;

export function initializeCanvas(selectorId) {
    canvas.element = document.getElementById(selectorId);
    canvas.context = canvas.element.getContext("2d");
    canvas.width = canvas.element.clientWidth;
    canvas.height = canvas.element.clientHeight;

    canvas.element.addEventListener('mousedown', onMouseDown);
    canvas.element.addEventListener('mousemove', onMouseMove);
    canvas.element.addEventListener('mouseup', onMouseUp);
    canvas.element.addEventListener('mouseleave', onMouseUp);
    canvas.element.addEventListener('click', onClick);
    canvas.element.addEventListener('wheel', onWheel, { passive: false });

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    console.log(canvas);
}

export function drawScreen() {
    if (!canvas.element || !canvas.context) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground("#181818C0");

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(viewState.camera.zoom, viewState.camera.zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.translate(viewState.camera.x, viewState.camera.y);

    if (treeDirty) {
        const {nodes, edges} = buildRenderableTree();
        nodes.forEach(node => {
            const tempCtx = canvas.context;
            tempCtx.font = "bold 18px Arial";
            const titleW = tempCtx.measureText(node.name).width;

            tempCtx.font = "14px Arial";
            const costW = tempCtx.measureText(`Cost: ${node.cost.toLocaleString()}`).width;
            const descW = node.description ? tempCtx.measureText(node.description).width : 0;

            const contentW = Math.max(titleW, costW, descW) + 32;
            node.w = Math.max(180, contentW);
            node.h = 40 + (node.description ? 60 : 40); // rough
        });

        viewState.nodes = nodes;
        viewState.edges = edges;
        computeNodePositions(nodes, edges, {
            hSpacing: 320,
            vSpacing: 180,
            nodeWidth: 220,
        });
        treeDirty = false;

        centerTreeOnCanvas(nodes);
    }

    // Draw dotted edges first (background layer)
    ctx.strokeStyle = "#666";
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 2;
    for (const edge of viewState.edges) {
        const from = viewState.nodes.find(n => n.id === edge.from);
        const to = viewState.nodes.find(n => n.id === edge.to);
        if (!from || !to) continue;

        ctx.beginPath();
        ctx.moveTo(from.centerX, from.centerY);
        ctx.lineTo(to.centerX, to.centerY);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw nodes
    for (const node of viewState.nodes) {
        drawUpgradeNode(node);
    }

    ctx.restore();
}

// =======================================================================
// All helper functions

function drawBackground(color) {
    if (!canvas.element || !canvas.context) return;
    clearScreen();
    canvas.context.fillStyle = color;
    canvas.context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(x, y, r, fill = null, stroke = null, lineWidth = 2) {
    if (!canvas.element || !canvas.context) return;
    const ctx = canvas.context;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

function clearScreen() {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = canvas.element.clientWidth;
    canvas.height = canvas.element.clientHeight;
    canvas.element.width = canvas.width;
    canvas.element.height = canvas.height;
}

function drawRoundedRect(x, y, w, h, r, fill, stroke, lineWidth = 2) {
    if (!canvas.element || !canvas.context) return;
    const ctx = canvas.context;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

function drawUpgradeNode(node) {
    const ctx = canvas.context;
    const paddingX = 16;
    const paddingY = 12;
    const lineHeight = 20;

    // Estimate required width & height
    ctx.font = "bold 18px Arial";
    const titleW = getTextWidth(node.name, ctx.font);

    ctx.font = "14px Arial";
    const costStr = `Cost: ${node.cost.toLocaleString()}`;
    const costW = getTextWidth(costStr, ctx.font);
    const descW = node.description
        ? getTextWidth(node.description, ctx.font)
        : 0;

    const contentWidth = Math.max(titleW, costW, descW) + paddingX * 2;
    const minWidth = 160; // don't make them too narrow
    node.w = Math.max(minWidth, contentWidth);

    // Height: title + cost + optional description + padding
    let lines = 2;
    if (node.description) lines++;
    node.h = paddingY * 2 + lineHeight * lines;

    // Center of node (for connections)
    node.centerX = node.x + node.w / 2;
    node.centerY = node.y + node.h / 2;

    // Draw rounded rect
    const bgColor = game.upgrades?.[node.id]?.purchased ? "#4CAF50" : "#444";
    const border = viewState.hoveredUpgradeId === node.id ? "#FFEB3B" : "#777";
    drawRoundedRect(node.x, node.y, node.w, node.h, 12, bgColor, border, 3);

    // Text - centered
    let yText = node.y + paddingY + 14; // baseline

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";

    // Title
    ctx.font = "bold 18px Arial";
    ctx.fillText(node.name, node.centerX, yText);
    yText += lineHeight;

    // Cost
    ctx.font = "14px Arial";
    ctx.fillText(costStr, node.centerX, yText);
    yText += lineHeight;

    // Description (optional)
    if (node.description) {
        ctx.fillText(node.description, node.centerX, yText);
    }
}

function getTextWidth(text, font) {
    canvas.context.font = font;
    return canvas.context.measureText(text).width;
}

function centerTreeOnCanvas(nodes) {
    if (nodes.length === 0) return;

    let minX = Infinity,
        maxX = -Infinity;
    let minY = Infinity,
        maxY = -Infinity;

    nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + n.w);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + n.h);
    });

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    const treeCenterX = minX + treeWidth / 2;
    const treeCenterY = minY + treeHeight / 2;

    const offsetX = canvasCenterX - treeCenterX;
    const offsetY = canvasCenterY - treeCenterY;

    // Apply offset to all nodes
    nodes.forEach(n => {
        n.x += offsetX;
        n.y += offsetY;
        n.centerX += offsetX;
        n.centerY += offsetY;
    });
}

//========================================================================
// Mouse Handlers
//========================================================================

function onMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    lastMouseX = e.offsetX;
    lastMouseY = e.offsetY;

    canvas.element.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    const rect = canvas.element.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
        const dx = e.offsetX - lastMouseX;
        const dy = e.offsetY - lastMouseY;

        viewState.camera.x += dx / viewState.camera.zoom;
        viewState.camera.y += dy / viewState.camera.zoom;

        lastMouseX = e.offsetX;
        lastMouseY = e.offsetY;

        drawScreen();
        return;
    }

    const hoveredId = getUpgradeAtPoint(mouseX, mouseY);
    const prevHovered = viewState.hoveredUpgradeId;
    if (hoveredId !== prevHovered) {
        viewState.hoveredUpgradeId = hoveredId;

        if (hoveredId) canvas.element.style.cursor = "pointer";
        else canvas.element.style.cursor = 'default';
    }
}

function onMouseUp() {
    isDragging = false;

    canvas.element.style.cursor = 'default';
}

function onWheel(e) {
    e.preventDefault();

    const zoomSpeed = 1.15;
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? zoomSpeed : 1 / zoomSpeed;

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const wx = (mouseX - canvas.width  / 2 - viewState.camera.x) / viewState.camera.zoom;
    const wy = (mouseY - canvas.height / 2 - viewState.camera.y) / viewState.camera.zoom;

    viewState.camera.zoom *= factor;
    viewState.camera.zoom  = Math.max(0.25, Math.min(6, viewState.camera.zoom));

    viewState.camera.x = mouseX - canvas.width  / 2 - wx * viewState.camera.zoom;
    viewState.camera.y = mouseY - canvas.height / 2 - wy * viewState.camera.zoom;
}

function onClick(e) {
    if (isDragging) return;

    // const rect = canvas.element.getBoundingClientRect();
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const clickedId = getUpgradeAtPoint(mouseX, mouseY);
    if (!clickedId) return;
    console.log(clickedId);

    // const upgrade = UPGRADES[clickedId];
    // if (!upgrade) return;

    // if (game.upgrades?.[clickedId]?.purchased) {
    //     console.log("Im not sure this code is correct");
    // }
}

function getUpgradeAtPoint(mouseX, mouseY) {
    const zoom = viewState.camera.zoom;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const worldX = (mouseX - cx - viewState.camera.x) / zoom + cx;
    const worldY = (mouseY - cy - viewState.camera.y) / zoom + cy;

    for (const node of viewState.nodes) {
        if (
            worldX >= node.x &&
            worldX <= node.x + node.w &&
            worldY >= node.y &&
            worldY <= node.y + node.h
        ) {
            return node.id;
        }
    }

    return null;
}
