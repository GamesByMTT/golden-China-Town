// MainLoader.ts

import { Scene, GameObjects } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";

export default class MainLoader extends Scene {
    resources: any;
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

        this.load.on('complete', () => {
            console.log("completecompletecompletecomplete");
            if (Globals.Socket?.socketLoaded) {
                    this.completeLoading();
            }
        });
    }


    private completeLoading() {
        console.log("completeLoading", this.isAssestLoaded, Globals.Socket?.socketLoaded);
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
            console.log("echeck");
            
            window.parent.postMessage("OnEnter", "*")
        }
            Globals.SceneHandler?.addScene('MainScene', MainScene, true)
    }
}
