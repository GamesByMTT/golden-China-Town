// MainLoader.ts

import { Scene, GameObjects } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import { SceneHandler } from "../scripts/SceneHandler";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";

export default class MainLoader extends Scene {
    resources: any;
    private progressBar: GameObjects.Sprite | null = null;
    private progressBox: GameObjects.Sprite | null = null;
    private logoImage: GameObjects.Sprite | null = null;
    private maxProgress: number = 0.7; // Cap progress at 70%
    private backgroundMusic: Phaser.Sound.BaseSound | null = null; // Add a variable for background music
    public soundManager: SoundManager; // Add a SoundManager instance
    isAssestLoaded: boolean = false

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.resources = LoaderConfig;
        this.soundManager = new SoundManager(this); 
    }

    preload() {
        console.log("CheckMainLoader Scene");

        this.load.start();

        Object.entries(LoaderConfig).forEach(([key, value]) => {
            this.load.image(key, value);
        });
        // Preload all sounds from LoaderSoundConfig
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            if (typeof value === "string") {
                this.load.audio(key, [value]); // Cast value to string
            }
        });

        setTimeout(() => {
            this.load.on('complete', () => {
                console.log("completecompletecompletecomplete");
                
                // Only complete progress after socket initialization
                if (Globals.Socket?.socketLoaded) {
                    this.completeLoading();
                }
            });
        }, 3000);
    }


    private completeLoading() {
        console.log("completeLoading", this.isAssestLoaded, Globals.Socket?.socketLoaded);
        // if (this.progressBox) {
        //     this.progressBox.destroy();
        // }
        // if (this.progressBar) {
        //     this.progressBar.destroy();
        // }
        // if(this.logoImage){
        //     this.logoImage.destroy();
        // }
        // this.updateProgressBar(1); // Set progress to 100%
        const loadedTextures = this.textures.list;
        Globals.resources = { ...loadedTextures }
        Object.entries(LoaderSoundConfig).forEach(([key]) => {
            Globals.soundResources[key] = new Howl({
                src: [LoaderSoundConfig[key]], // Use the same source as you provided for loading
                autoplay: false,
                loop: false,
            });
        });
        this.isAssestLoaded = true
        this.loadScene()
    }

    public loadScene() {
        console.log("loadScene", this.isAssestLoaded, Globals.Socket?.socketLoaded);
        // this.completeLoading();
        if(this.isAssestLoaded && Globals.Socket?.socketLoaded){
            window.parent.postMessage("OnEnter", "*")
        }
            Globals.SceneHandler?.addScene('MainScene', MainScene, true)
    }
}
