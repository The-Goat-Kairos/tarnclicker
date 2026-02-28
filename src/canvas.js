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
let treeDirty = true;

export function initializeCanvas(selectorId) {
    canvas.element = document.getElementById(selectorId);
    canvas.context = canvas.element.getContext("2d");
    canvas.width = canvas.element.clientWidth;
    canvas.height = canvas.element.clientHeight;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    console.log(canvas);
}

export function drawScreen() {
    if (!canvas.element || !canvas.context) return;
    drawBackground("#181818C0");

    if (treeDirty) {
        const {nodes, edges} = buildRenderableTree();
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

    const ctx = canvas.context;

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
