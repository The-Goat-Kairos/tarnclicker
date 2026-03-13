// ====================================o=========
// Game State
// =============================================

export let game = {
    pets: 0,
    petsPerSecond: 0,
    petsPerClick: 1,

    globalProductionMultiplier: 1,

    img: "tarn", // Options are "tarn", "owl", "shavie"
    petting: false,
    pettingImageBox: null,

    buildings: [
        {
            id: "shavie",
            name: "Shavie",
            count: 0,
            basePrice: 15,
            baseProduction: 1,
            currentPrice: 15,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/shavie.jpg",
        },
        {
            id: "owl",
            name: "Owl",
            count: 0,
            basePrice: 100,
            baseProduction: 8,
            currentPrice: 100,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/owl.png",
        },
        {
            id: "mujika",
            name: "Mujika",
            count: 0,
            basePrice: 1100,
            baseProduction: 47,
            currentPrice: 1100,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/mujika.webp",
        },
        {
            id: "god",
            name: "God Herself",
            count: 0,
            basePrice: 12000,
            baseProduction: 260,
            currentPrice: 12000,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/god.jpg",
        },
        {
            id: "midna",
            name: "Midna",
            count: 0,
            basePrice: 130000,
            baseProduction: 1400,
            currentPrice: 130000,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/midna.jpg",
        },
        {
            id: "bettershavie",
            name: "A Better Shavie",
            count: 0,
            basePrice: 1400000,
            baseProduction: 7800,
            currentPrice: 1400000,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/bettershavie.png",
        },
        {
            id: "betterowl",
            name: "A Better(?) Owl",
            count: 0,
            basePrice: 20000000,
            baseProduction: 44000,
            currentPrice: 20000000,
            priceMultiplier: 1.15,
            iconSrc: "./imgs/betterowl.png",
        },
    ],
};

export const elements = {
    petCount: document.getElementById("pet-count-text"),
    petPs: document.getElementById("pet-ps-text"),

    tarn_img_element: document.getElementById("tarn-image"),
    glow_element: document.getElementById("glow"),
    pettingHand: document.getElementById("petting-hand"),

    settingsModal: document.getElementById("settings-modal"),
    openSettingsBtn: document.getElementById("settings-open-btn"),
    closeSettingsBtn: document.getElementById("settings-close-btn"),
    tarnImgSettingsBtn: document.getElementById("pic-tarn"),
    shavieImgSettingsBtn: document.getElementById("pic-shavie"),
    owlImgSettingsBtn: document.getElementById("pic-owl"),

    shopsSection: document.getElementById("shops-section"),
};


export const audios = {
    backgroundSlimeAdventure: null,
    clickSoundEffect: null,
}

export function initializeAudios() {
    // audios.backgroundSlimeAdventure = new Audio("/audio/slime-adventure.mp3");
    // audios.backgroundSlimeAdventure.volume = 0.15;
    // audios.backgroundSlimeAdventure.loop = true;
    // audios.backgroundSlimeAdventure.play().then(() => {
    // }).catch(_ => {
    //     document.getElementById('audio-prompt').style.display = 'block';
    //
    //     document.getElementById('enable-audio-btn').addEventListener('click', function() {
    //         document.getElementById('audio-prompt').style.display = 'none';
    //         audios.backgroundSlimeAdventure.play().catch(err => {
    //             console.error('Audio still cannot be played:', err);
    //         });
    //     });
    // });

    audios.clickSoundEffect = new Audio("/audio/soft-click-button.mp3");
    audios.clickSoundEffect.volume = 0.2;
}

export function formatNumber(n) {
    return Math.floor(n).toLocaleString() + " pets";
}

export function setImg(new_image) {
    if (["tarn", "shavie", "owl"].includes(new_image)) {
        game.img = new_image;
        elements.tarn_img_element.src = `./imgs/${game.img}_icon_normal.png`;
    }
    else alert("SOMETHINGS UP");
}

export function getBuildingProduction(building) {
    return (
        building.count *
        building.baseProduction *
        game.globalProductionMultiplier
    );
}

export function calculateTotalPPS() {
    return game.buildings.reduce((sum, b) => sum + getBuildingProduction(b), 0);
}

export function updatePrice(building) {
    building.currentPrice = Math.ceil(
        building.basePrice * Math.pow(building.priceMultiplier, building.count)
    );
}

export function updateImageBox() {
    game.pettingImageBox = elements.tarn_img_element.getBoundingClientRect();
}
