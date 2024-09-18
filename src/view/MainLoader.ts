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
    private BgImg: GameObjects.Sprite | null = null;
    private progressBox: GameObjects.Sprite | null = null;
    private logoImage: GameObjects.Sprite | null = null;
    private title: GameObjects.Sprite | null = null;
    private star: GameObjects.Sprite | null = null;
    private maxProgress: number = 0.7; // Cap progress at 70%
    public soundManager: SoundManager; // Add a SoundManager instance
    private progressBarContainer!: Phaser.GameObjects.Graphics;
    private progressBarFill!: Phaser.GameObjects.Graphics;
    private progressBarWidth: number = 350; // Adjust as needed
    private progressBarHeight: number = 12;  // Adjust as needed
    private borderRadius: number = 5;      // Adjust for corner radius

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.resources = LoaderConfig;
        this.soundManager = new SoundManager(this); 
    }

    preload() {
        // Load the background 
        window.parent.postMessage("OnEnter", "*")
        
        
        this.load.image("BackgroundNewLayer", "src/sprites/bg.png");

        this.load.image("logo", "src/sprites/ElDorado.png");
        this.load.svg("title", "src/sprites/title.svg");
        // this.load.image('loaderBg', "src/sprites/loaderBg.png")
        this.load.image("assetsloader", "src/sprites/assetsLoader.png")
        this.load.spritesheet('star', "src/sprites/star-animation.png", { 
            frameWidth: 120,  // Width of each frame in the spritesheet
            frameHeight: 80 // Height of each frame in the spritesheet
          });
        // Once the background image is loaded, start loading other assets
        this.load.once('complete', () => {
            this.addBackgroundImage();
            this.startLoadingAssets();
        });
    }

    private addBackgroundImage() {
        const { width, height } = this.scale;
        this.BgImg = this.add.sprite(width / 2, height / 2, 'BackgroundNewLayer').setScale(2.5, 2.5)
        this.logoImage = this.add.sprite(width/2, 450, 'logo')
        this.title = this.add.sprite(width/2, 650, "title").setScale(1.3, 1.3);

        // Progress Bar Container
        this.progressBarContainer = this.add.graphics();
        this.progressBarContainer.fillStyle(0x222222);
        this.drawRoundedRect(
            this.progressBarContainer,
            this.cameras.main.width / 2 - this.progressBarWidth / 2,
            this.cameras.main.height / 2 + 170,
            this.progressBarWidth,
            this.progressBarHeight,
            this.borderRadius
        );
         // Progress Bar Fill (Start at the center of the container)
         this.progressBarFill = this.add.graphics();
         this.progressBarFill.fillStyle(0xfaf729);
         this.progressBarFill.setPosition(
             this.cameras.main.width/2, // Center x
             this.cameras.main.height/2 + 170                           
         );
         this.expandProgressBar();
        let progress = 0;
        const loadingInterval = setInterval(() => {
        progress += 0.01;
        this.updateProgressBar(progress);
        if (progress >= 1) {
            clearInterval(loadingInterval);
            // ... (trigger your game start logic here) ...
        }
        }, 30); 

        this.anims.create({
            key: 'playStarAnimation', // Give your animation a unique key
            frames: this.anims.generateFrameNumbers('star', { start: 0, end: 75 - 1 }), // Generate frame numbers
            frameRate: 10, // Adjust the frame rate as needed
            repeat: -1     // Repeat indefinitely (-1) or set a specific repeat count
          });

        const animatedSprite = this.add.sprite(width/2, 650, 'star'); // Add the sprite
        animatedSprite.play('playStarAnimation'); // Play the animation
    }

    private expandProgressBar() {
        this.tweens.add({
          targets: this.progressBarFill,
          scaleX: { from: 0, to: 1 },
          duration: 700,
          ease: 'Linear',
          onComplete: () => { 
            // When expansion completes, start contraction
            this.contractProgressBar(); 
          }
        });
      }
    
      private contractProgressBar() {
        this.tweens.add({
          targets: this.progressBarFill,
          scaleX: { from: 1, to: 0 },
          duration: 700,
          ease: 'Linear',
          onComplete: () => { 
            // When contraction completes, start expansion again
            this.expandProgressBar(); 
          }
        });
      }

    private drawRoundedRect(
        graphics: Phaser.GameObjects.Graphics, 
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        radius: number
      ) {
        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, 3 * Math.PI / 2, false);
        graphics.closePath();
        graphics.fillPath();
      }
    
      private updateProgressBar(value: number) {
        const currentWidth = this.progressBarWidth * value; 

        this.progressBarFill.clear();
        this.progressBarFill.fillStyle(0xfaf729);
        this.drawRoundedRect(
            this.progressBarFill, 
            -currentWidth / 2, // Start drawing half the width to the left
            0, 
            currentWidth, 
            this.progressBarHeight, 
            this.borderRadius
        );
    }


    private startLoadingAssets() {
        // Load all assets from LoaderConfig
        console.log("startLoadingAssets");
        this.load.start();
        Object.entries(LoaderConfig).forEach(([key, value]) => {
            this.load.image(key, value);
        });
        this.load.start();
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            if (typeof value === "string") {
                this.load.audio(key, [value]); // Cast value to string
            }
        });
        this.load.on('progress', (value: number) => {
            const adjustedValue = Math.min(value * this.maxProgress, this.maxProgress);
            // this.updateProgressBar(adjustedValue);
        });
        this.load.on('complete', () => {
            if (Globals.Socket?.socketLoaded) {
                this.loadScene();
            }
        });       
    }

    private completeLoading() {
        if(this.BgImg){
            this.BgImg.destroy();
        }
        if (this.progressBox) {
            this.progressBox.destroy();
        }
        if (this.progressBar) {
            this.progressBar.destroy();
        }
        if(this.logoImage){
            this.logoImage.destroy();
        }
        if(this.title){
            this.title.destroy()
        }
        if(this.progressBarContainer){
            this.progressBarContainer.destroy()
        }
        if(this.progressBarFill){
            this.progressBarFill.destroy()
        }
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
    }

    public loadScene() {
        this.completeLoading();
        Globals.SceneHandler?.addScene('MainScene', MainScene, true)
    }
}