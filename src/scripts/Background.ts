import Phaser from "phaser";
import { Scene } from "phaser";
import { ResultData, Globals } from "./Globals";
import MainScene from "../view/MainScene";
import { LoaderConfig, LoaderSoundConfig } from "./LoaderConfig";
import SoundManager from "./SoundManager";
import { Howl } from "howler";

export default class Background extends Scene{
  resources: any;
  public soundManager: SoundManager; // Add a SoundManager instance
  isAssetsLoaded: boolean = false;

  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
      super(config);
      this.resources = LoaderConfig;
      this.soundManager = new SoundManager(this) 
  }
    preload(){
      console.log("Background Scene Load");
      
        this.load.image("BackgroundNew", "src/sprites/NewBackground.png");

        this.loadAssets();
        // this.loadSounds();

        this.load.on('complete', this.onLoadComplete, this);
      //  this.load.audio("backgroundMusic", "src/sounds/Teaser.wav")
        
    }
    create(){
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'BackgroundNew').setOrigin(0.5).setDisplaySize(width, height);
      //  this.backgroundMusic = this.sound.add("backgroundMusic", { loop: true, volume: 0.1 });
      //  this.backgroundMusic.play();
    }


    loadAssets() {
      Object.entries(LoaderConfig).forEach(([key, value]) => {
        this.load.image(key, value);
        console.log("Queued for loading:", key); // Log after queuing
      });
      this.load.on('start', () => {
        console.log("Loading started");
      })
      this.load.on('progress', (value: any) => {
        console.log("Loading progress:", value); // More informative progress
      });

      this.load.on('loaderror', (file:any) => {
        console.error('Error loading sound:', file.key);
      });
      console.log("SoundsLoaded now check for complete", this.load);
    }

    // loadSounds() {
    //   Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
    //       if (typeof value === "string") {
    //           this.load.audio(key, [value]); // Load sounds from LoaderSoundConfig
    //       }
    //   });
     
    // }

    private onLoadComplete() {
      console.log("All assets and sounds loading complete");
      this.completeLoading();
    }

    private completeLoading() {
      // Ensure assets and socket are both ready before proceeding
      this.isAssetsLoaded = true;
      console.log("completeLoading", this.isAssetsLoaded, Globals.Socket?.socketLoaded);

      // Store loaded assets in Globals
      const loadedTextures = this.textures.list;
      Globals.resources = { ...loadedTextures };

      // // Load sound resources
      // Object.entries(LoaderSoundConfig).forEach(([key]) => {
      //     Globals.soundResources[key] = new Howl({
      //         src: [LoaderSoundConfig[key]], // Use the same source as for loading
      //         autoplay: false,
      //         loop: false,
      //     });
      // });

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