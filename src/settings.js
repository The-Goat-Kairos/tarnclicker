import { game, elements, setImg } from './gameState.js';
import { render, updatePettingHandLocation } from './render.js';

function openSettings() {
    elements.settingsModal.classList.remove("hidden");
}

function closeSettings() {
    elements.settingsModal.classList.add("hidden");
}



// Reset Button

export function initializeSettings() {
    elements.openSettingsBtn.addEventListener("click", openSettings);
    elements.closeSettingsBtn.addEventListener("click", closeSettings);

    elements.settingsModal.addEventListener("click", e => {
        if (e.target === elements.settingsModal) {
            closeSettings();
        }
    });

    // ACTUAL SETTINGS

    // Which image?
    elements.tarnImgSettingsBtn.checked = game.img == "tarn";
    elements.shavieImgSettingsBtn.checked = game.img == "shavie";
    elements.owlImgSettingsBtn.checked = game.img == "owl";

    elements.tarnImgSettingsBtn.addEventListener("click", () => {
        setImg("tarn");
        updatePettingHandLocation();
        render();
    });
    elements.shavieImgSettingsBtn.addEventListener("click", () => {
        setImg("shavie");
        updatePettingHandLocation();
        render();
    });
    elements.owlImgSettingsBtn.addEventListener("click", () => {
        setImg("owl");
        updatePettingHandLocation();
        render();
    });

    document.getElementById("reset-game-btn")?.addEventListener("click", () => {
        if (
            confirm(
                "Are you sure you want to reset EVERYTHING?\nThis cannot be undone!"
            )
        ) {
            game.pets = 0;
            game.petsPerSecond = 0;
            game.petsPerClick = 1;
            game.globalProductionMultiplier = 1;

            game.buildings.forEach(building => {
                building.count = 0;
                building.currentPrice = building.basePrice;
            });

            // localStorage.removeItem('tarnClickerSave');

            render();
            alert("Game has been reset!");
        }
    });

}