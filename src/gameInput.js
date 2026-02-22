import { game, elements, updatePrice, calculateTotalPPS, audios } from './gameState.js';
import { render } from './render.js';

export async function pet() {
    game.pets += game.petsPerClick;
    game.petting = true;
    render();

    audios.clickSoundEffect.play().catch(error => {
        console.error("[ERROR]: playing sound: ", error);
    });

    // Animation
    elements.pettingHand.style.transition = "none";
    elements.pettingHand.style.transform = "translateY(0) rotate(30deg)";
    elements.pettingHand.style.opacity = "1";

    if (["tarn", "shavie", "owl"].includes(game.img))
        elements.tarn_img_element.src = `./imgs/${game.img}_icon_blush.png`;
    else alert("HEY SOMETHINGS WRONG");

    elements.pettingHand.offsetHeight;

    elements.pettingHand.style.transition = "transform 0.2s";
    elements.pettingHand.style.transform = "translateY(30px) rotate(30deg)";
    elements.pettingHand.style.zIndex = "99999";

    setTimeout(() => {
        elements.pettingHand.style.opacity = "0";
        elements.pettingHand.style.zIndex = "0";

        if (["tarn", "shavie", "owl"].includes(game.img))
            elements.tarn_img_element.src = `./imgs/${game.img}_icon_normal.png`;
        else alert("HEY SOMETHINGS WRONG");
        game.petting = false;
    }, 200);
}

export async function tryBuyBuilding(buildingId, buildingElement) {
    const building = game.buildings.find(b => b.id === buildingId);
    if (!building) return;

    if (game.pets < building.currentPrice) {
        buildingElement.style.backgroundColor = "#3d0c0c";
        setTimeout(() => {
            buildingElement.style.backgroundColor = "#181818";
        }, 160);
        return;
    }

    game.pets -= building.currentPrice;
    building.count += 1;

    updatePrice(building);

    game.petsPerSecond = calculateTotalPPS();

    render();
}

export function initializeInput() {
    document.getElementById('tarn-button').addEventListener("click", pet);

}
