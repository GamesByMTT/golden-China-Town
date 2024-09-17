// MainLoader.ts

import { Scene, GameObjects } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";

export default class MainLoader extends Scene {
    resources: any;
    private progressBar: GameObjects.Sprite | null = null;
    private progressBox: GameObjects.Sprite | null = null;
    private logoImage: GameObjects.Sprite | null = null;
    private maxProgress: number = 0.7; // Cap progress at 70%
    private loadingInterval: NodeJS.Timer | undefined; // Store the interval reference
    private backgroundMusic: Phaser.Sound.BaseSound | null = null; // Add a variable for background music
    public soundManager: SoundManager; // Add a SoundManager instance

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.resources = LoaderConfig;
        this.soundManager = new SoundManager(this); 
    }

    preload() {
        // Load the background image first
        this.load.image("Background", "src/sprites/Background.jpg");
        this.load.image("logo", "src/sprites/chinaTown.png");
        this.load.image('loaderBg', "src/sprites/loaderBg.png")
        this.load.image("assetsloader", "src/sprites/assetsLoader.png")
       
        // Once the background image is loaded, start loading other assets
        this.load.once('complete', () => {
            this.addBackgroundImage();
            this.startLoadingAssets();
        });
    }

    private addBackgroundImage() {        
        const { width, height } = this.scale;
        // this.add.image(width / 2, height / 2, 'Background').setOrigin(0.5).setDisplaySize(width, height);
        this.logoImage = this.add.sprite(width/2, 300, 'logo').setScale(0.8, 0.8)
 
        // Initialize progress bar graphics
        this.progressBox = this.add.sprite(width / 2, height / 2 + 400, "loaderBg")

        // Initialize progress bar using assetsLoader.png image
        this.progressBar = this.add.sprite(width / 2 + 5, height / 2 + 398, "assetsloader")
        this.progressBar.setCrop(0, 0, 0, this.progressBar.height); // Start with 0 width
    }

    private startLoadingAssets() {
        console.log("startLoadingAssets");
        this.load.start();
        this.loadingInterval = setInterval(() => {
            this.repeatAssetLoad()
        }, 100);
    }

    private repeatAssetLoad(){
        console.log("repeatAssetLoad");
        this.load.start();
        Object.entries(LoaderConfig).forEach(([key, value]) => {
            this.load.image(key, value);
        });
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            if (typeof value === "string") {
                this.load.audio(key, [value]); // Cast value to string
            }
        });
        this.load.on('progress', (value: number) => {
            const adjustedValue = Math.min(value * this.maxProgress, this.maxProgress);
            this.updateProgressBar(adjustedValue);
        });
        this.load.on('complete', () => {
            if (this.loadingInterval) {
                clearInterval(this.loadingInterval);
                this.loadingInterval = undefined; // Optional: Reset to undefined
            }
            if (Globals.Socket?.socketLoaded) {
                this.loadScene();
            }
        });
    }

    private updateProgressBar(value: number) {
        const { width } = this.scale;
        console.log("updateProgressBar", value);
        if (this.progressBar) {
            // Update the crop width of the progress bar sprite based on the value
            this.progressBar.setCrop(0, 0, this.progressBar.width * value, this.progressBar.height);
        }
    }

    private completeLoading() {
        if (this.progressBox) {
            this.progressBox.destroy();
        }
        if (this.progressBar) {
            this.progressBar.destroy();
        }
        if(this.logoImage){
            this.logoImage.destroy();
        }
        this.updateProgressBar(1); // Set progress to 100%
        const loadedTextures = this.textures.list;
        Globals.resources = { ...loadedTextures }
        Object.entries(LoaderSoundConfig).forEach(([key]) => {
            Globals.soundResources[key] = new Howl({
                src: [LoaderSoundConfig[key]], // Use the same source as you provided for loading
                autoplay: false,
                loop: false,
            });
        });
    }

    public loadScene() {
        this.completeLoading();
        window.parent.postMessage("OnEnter", "*")
        Globals.SceneHandler?.addScene('MainScene', MainScene, true)
    }
}