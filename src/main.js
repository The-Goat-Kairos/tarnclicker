import { game } from './gameState.js';
import { render, initializeRender, updatePettingHandLocation } from './render.js';
import { initializeInput } from './gameInput.js';
import { initializeBuildings } from './buildings.js';
import { initializeSettings } from './settings.js';
// import { initCanvas } from './canvasRenderer.js';

let lastTime = performance.now();

function gameLoop(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    game.pets += game.petsPerSecond * delta;

    // drawBackground();

    render();
    updatePettingHandLocation();

    requestAnimationFrame(gameLoop);
}

// initCanvas();
initializeSettings();
initializeInput();
initializeBuildings();
initializeRender();
requestAnimationFrame(gameLoop);

// import { initSettings } from './settings.js';
// initSettings();




// =============================================
// Mobile Messages
// =============================================

function showMobileMessage() {
    const mobileMessage = document.getElementById("mobile-message");
    const isMobile = window.innerWidth <= 768; // Adjust this value for mobile detection
    const isSmallViewport = window.innerWidth < 600; // Adjust for minimum viewport on desktop

    if (isMobile || isSmallViewport) {
        mobileMessage.style.display = "flex";
    } else {
        mobileMessage.style.display = "none";
    }
}

window.addEventListener("resize", () => {
    showMobileMessage();
    updatePettingHandLocation();
});