import { canvas } from "./canvas.js";

export const UPGRADES = {
    "click_power_1": {
        name: "Powerful Clicks I",
        description: "Doubles manual petting power",
        cost: 50,
        effect: (gs) => { gs.petsPerClick *= 2; },
        prereqs: [],
        row: 0, col: 0,
    },
    "click_power_2": {
        name: "Powerful Clicks II",
        description: "Doubles manual petting power. Again",
        cost: 75,
        effect: (gs) => { gs.petsPerClick *= 2; },
        prereqs: ["click_power_1"],
        row: 1, col: 0,
    },
    "better_shavie_1": {
        name: "Improves Shavies petting power",
        description: "Doubles Shavies petting power",
        cost: 75,
        effect: (gs) => { gs.petsPerClick *= 2; },
        prereqs: ["click_power_1"],
        row: 1, col: 0,
    },
};

export function buildRenderableTree() {
    const nodes = [];
    const edges = [];

    for (const [id, up] of Object.entries(UPGRADES)) {
        nodes.push({
            id,
            x: 0, y: 0,         // will be computed
            name: up.name,
            description: up.description,
            cost: up.cost,
            purchased: false,   // will come from gameState later
            row: up.row ?? 0,
            col: up.col ?? 0,
        });

        for (const preId of (up.prereqs ?? [])) {
            edges.push({ from: preId, to: id });
        }
    }

    return { nodes, edges };
}

export function computeNodePositions(nodes, edges, options = {}) {
    const {
        nodeWidth = 180,
        hSpacing = 320,          // increased default
        vSpacing = 160
    } = options;

    const byRow = {};
    nodes.forEach(n => {
        const r = n.row ?? 0;
        byRow[r] = byRow[r] || [];
        byRow[r].push(n);
    });

    Object.values(byRow).forEach(rowNodes => {
        rowNodes.sort((a,b) => (a.col ?? 0) - (b.col ?? 0));
    });

    const rows = Object.keys(byRow).map(Number).sort((a,b)=>a-b);

    rows.forEach((rowIdx, visualRowIndex) => {
        const rowNodes = byRow[rowIdx];
        const y = visualRowIndex * vSpacing + 120;  // top padding

        // Calculate total width of this row (using actual node.w)
        let totalRowWidth = 0;
        rowNodes.forEach(node => totalRowWidth += node.w);
        const gaps = rowNodes.length - 1;
        totalRowWidth += gaps * (hSpacing - 100);  // rough — adjust

        let currentX = (canvas.width / 2) - (totalRowWidth / 2);

        rowNodes.forEach(node => {
            node.x = currentX;
            node.y = y;
            node.centerX = node.x + node.w / 2;
            node.centerY = node.y + node.h / 2;

            currentX += node.w + hSpacing;   // ← key change: advance by actual width + spacing
        });
    });
}
