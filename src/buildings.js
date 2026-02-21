import { game, elements } from './gameState.js';
import { tryBuyBuilding } from './gameInput.js';

function generateBuildings() {
    for (let shop of game.buildings) {
        const shopDiv = document.createElement("div");
        shopDiv.classList.add("shop");
        shopDiv.classList.add(`${shop.id}-shop`);
        shopDiv.setAttribute('data-building', shop.id);

        const shopImg = document.createElement('img');
        shopImg.src = shop.iconSrc;
        shopImg.classList.add('shop-icon');
        shopImg.alt = shop.name;
        shopImg.width = 50;
        shopImg.height = 50;
        shopDiv.appendChild(shopImg);

        const shopInfoDiv = document.createElement("div");
        shopInfoDiv.classList.add("shop-info-box");
        shopDiv.appendChild(shopInfoDiv);

        const nameP = document.createElement("p");
        nameP.classList.add("shop-name");
        nameP.innerText = shop.name;
        shopInfoDiv.appendChild(nameP);
        const priceP = document.createElement("p");
        priceP.classList.add("shop-price");
        priceP.innerText = shop.currentPrice;
        shopInfoDiv.appendChild(priceP);
        const ppsP = document.createElement("p");
        ppsP.classList.add("shop-pps");
        ppsP.innerText = shop.baseProduction;
        shopInfoDiv.appendChild(ppsP);

        const amountP = document.createElement("p");
        amountP.classList.add("shop-amount");
        amountP.innerText = shop.count;
        shopDiv.appendChild(amountP);

        elements.shopsSection.appendChild(shopDiv);
    }
}

export function initializeBuildings() {
    document.getElementById("shops-section").addEventListener("click", e => {
        const shop = e.target.closest(".shop");
        if (!shop) return;

        const buildingId = [...shop.classList]
        .find(cls => cls.endsWith("-shop"))
        ?.replace("-shop", "");

        if (buildingId) {
            tryBuyBuilding(buildingId, shop);
        }
    });

    generateBuildings();
}