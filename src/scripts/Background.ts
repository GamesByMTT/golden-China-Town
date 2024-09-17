import Phaser from "phaser";
import { Scene } from "phaser";
import { LoaderConfig } from "./LoaderConfig";
import SoundManager from "./SoundManager";

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
    }
    create(){
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'BackgroundNew').setOrigin(0.5).setDisplaySize(width, height);
    }

}