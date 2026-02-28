import { game, elements, updateImageBox, formatNumber, getBuildingProduction } from './gameState.js';
import { drawScreen } from './canvas.js';

export function initializeRender() {
    game.pettingImageBox = elements.tarn_img_element.getBoundingClientRect();
    const glow_size = 150;

    elements.glow_element.style.left =
        game.pettingImageBox.left - glow_size / 2 + 25 + game.pettingImageBox.width / 2 + "px";
    elements.glow_element.style.top = game.pettingImageBox.top + 25 + game.pettingImageBox.height / 2 + "px";

    updatePettingHandLocation();
    render();
}

export function render() {
    elements.petCount.innerHTML = formatNumber(game.pets);
    elements.petPs.innerHTML = `Per second: ${Math.floor(game.petsPerSecond)}`;

    drawScreen();

    // Update all shop items
    game.buildings.forEach(updateShopItems);
}

function updateShopItems(building) {
        const shopEl = document.querySelector(`.shop.${building.id}-shop`);

        if (!shopEl) return; // not rendered yet → skip

        const priceEl = shopEl.querySelector(".shop-price");
        const amountEl = shopEl.querySelector(".shop-amount");
        const ppsEl = shopEl.querySelector(".shop-pps");

        priceEl.textContent = `${building.currentPrice} pets`;
        amountEl.textContent = building.count;
        ppsEl.textContent = `${getBuildingProduction(building)} pet/s`;

        if (game.pets >= building.currentPrice) {
            shopEl.classList.remove("disabled");
        } else {
            shopEl.classList.add("disabled");
        }
}

export function updatePettingHandLocation() {
    updateImageBox();

    const rect = document.getElementById("tarn-image").getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top  + rect.height / 2;

    const THETA = 30 / 360 * 2 * Math.PI; // Icon is rotated 30 degrees but Math.cos/Math.sin take radians
    const WIDTH = elements.pettingHand.getBoundingClientRect().width;
    const HEIGHT = elements.pettingHand.getBoundingClientRect().height;
    const NEW_WIDTH = WIDTH * Math.cos(THETA) + HEIGHT * Math.sin(THETA); // The long width after rotation
    const NEW_HEIGHT = HEIGHT * Math.cos(THETA) + WIDTH * Math.sin(THETA);

    const offsets = {
        tarn:   { x: rect.width * 0.34,  y: rect.height * -0.08 },
        shavie: { x: rect.width * 0.08,  y: rect.height * -0.06 },
        owl:    { x: rect.width * 0.12,  y: rect.height * -0.14 },
    };
    const offset = offsets[game.img] || offsets.tarn;

    const handX = centerX + offset.x - NEW_WIDTH / 2;
    const handY = centerY + offset.y - NEW_HEIGHT / 2;

    elements.pettingHand.style.left = handX + "px";
    elements.pettingHand.style.top  = handY + "px";
}
