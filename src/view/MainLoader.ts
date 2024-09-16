import { Scene, GameObjects } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";

export default class MainLoader extends Scene {
    resources: any;
    public soundManager: SoundManager; // Add a SoundManager instance
    isAssetsLoaded: boolean = false;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.resources = LoaderConfig;
        this.soundManager = new SoundManager(this); 
    }

    preload() {
        console.log("Check MainLoader Scene");

        // Start loading assets and sounds
        this.loadAssets();
        this.loadSounds();

        // Listen for the load completion event
        this.load.on('complete', () => {
            console.log("Assets loading complete");
            this.completeLoading();
        });
    }

    loadAssets() {
        Object.entries(LoaderConfig).forEach(([key, value]) => {
            console.log(key, "Images");
            this.load.image(key, value);
        });
    }

    loadSounds() {
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            console.log(key, "Sounds");
            
            if (typeof value === "string") {
                this.load.audio(key, [value]); // Load sounds from LoaderSoundConfig
            }
        });
    }

    private completeLoading() {
        // Ensure assets and socket are both ready before proceeding
        this.isAssetsLoaded = true;
        console.log("completeLoading", this.isAssetsLoaded, Globals.Socket?.socketLoaded);

        // Store loaded assets in Globals
        const loadedTextures = this.textures.list;
        Globals.resources = { ...loadedTextures };

        // Load sound resources
        Object.entries(LoaderSoundConfig).forEach(([key]) => {
            Globals.soundResources[key] = new Howl({
                src: [LoaderSoundConfig[key]], // Use the same source as for loading
                autoplay: false,
                loop: false,
            });
        });

        // Check if socket is loaded, then load the scene
        this.checkSocketAndProceed();
    }

    checkSocketAndProceed() {
        console.log("Checking if socket is loaded and assets are ready...");
        // Continuously check if the socket is loaded
        const socketInterval = setInterval(() => {
            console.log("checking Interval");
            
            if (this.isAssetsLoaded && Globals.Socket?.socketLoaded) {
                clearInterval(socketInterval); // Stop checking when socket is loaded
                this.loadScene();
            }
        }, 100); // Check every 100ms
    }

    public loadScene() {
        // Trigger postMessage to the parent window
        window.parent.postMessage("OnEnter", "*");
        // Add and start MainScene
        Globals.SceneHandler?.addScene('MainScene', MainScene, true);
    }
}
