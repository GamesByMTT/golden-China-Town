import Phaser, { Scene, GameObjects } from "phaser";
import { Globals, currentGameData } from "../Globals";
import { InteractiveBtn } from "../InteractiveBtn";
import SoundManager from "../SoundManager";
import { gameConfig } from "../appconfig";

export class SettingPopup extends GameObjects.Container {
    // SoundManager: SoundManager;
    settingClose!: InteractiveBtn;
    soundEnabled: boolean = true; // Track sound state
    musicEnabled: boolean = true; // Track sound state
    toggleBar!: InteractiveBtn;
    constructor(scene: Scene) {
        super(scene)
        // this.SoundManager = SoundManager;
        const popupBg = this.scene.add.image(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5, 'settingPopup').setDepth(9);
        const settingText = this.scene.add.image(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5 - 350, "settingText").setDepth(9).setOrigin(0.5)
        const soundsImage = this.scene.add.image(gameConfig.scale.width * 0.5 - 200, gameConfig.scale.height * 0.5 - 120, 'soundImage').setDepth(10);
        const musicImage = this.scene.add.image(gameConfig.scale.width * 0.5 - 200, gameConfig.scale.height * 0.5 + 50, 'musicImage').setDepth(10);

        const toggleBarSprite = [
            this.scene.textures.get('toggleBar'),
            this.scene.textures.get('toggleBar')
        ];
        if (this.soundEnabled) {

        }
        const initialTexture = currentGameData.soundMode ? "onButton" : "offButton";
        let onOff: any
        if (!currentGameData.soundMode) {
            onOff = this.scene.add.image(gameConfig.scale.width * 0.5 + 160, gameConfig.scale.height * 0.5 - 120, initialTexture);
        } else {
            onOff = this.scene.add.image(gameConfig.scale.width * 0.5 + 240, gameConfig.scale.height * 0.5 - 120, initialTexture);
        }
        onOff.setInteractive()
        onOff.on('pointerdown', () => {
            this.toggleSound(onOff);
        })

        const toggleMusicBar = this.scene.add.image(gameConfig.scale.width * 0.5 + 200, gameConfig.scale.height * 0.5 + 50, "toggleBar")
        const musicinitialTexture = currentGameData.musicMode ? "onButton" : "offButton";

        let offMusic: any
        if (!currentGameData.musicMode) {
            offMusic = this.scene.add.image(gameConfig.scale.width * 0.5 + 160, gameConfig.scale.height * 0.5 +50, musicinitialTexture);
        } else {
            offMusic = this.scene.add.image(gameConfig.scale.width * 0.5 + 240, gameConfig.scale.height * 0.5 + 50, musicinitialTexture);
        }
        offMusic.setInteractive();
        offMusic.on('pointerdown', () => {
            this.toggleMusic(offMusic)
        })

        this.toggleBar = new InteractiveBtn(this.scene, toggleBarSprite, () => {
            // this.toggleSound();
        }, 0, true).setPosition(gameConfig.scale.width * 0.5 + 200, gameConfig.scale.height * 0.5 - 120);

        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButtonPressed')
        ];
        this.settingClose = new InteractiveBtn(this.scene, exitButtonSprites, () => {
            this.buttonMusic("buttonpressed")
            this.scene.events.emit("closePopup")
        }, 0, true);
        this.settingClose.setPosition(gameConfig.scale.width * 0.5 + 320, gameConfig.scale.height * 0.5 - 250).setScale(0.8);

        popupBg.setOrigin(0.5);
        popupBg.setAlpha(1); // Set background transparency
        this.add([popupBg, this.settingClose, soundsImage, musicImage, this.toggleBar, onOff, toggleMusicBar, offMusic, settingText]);
    }

    toggleSound(onOff: any) {
        // Toggle sound state
        console.log(onOff, "onOff");
        currentGameData.soundMode = !currentGameData.soundMode
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            onOff.setTexture('onButton');
            onOff.setPosition(gameConfig.scale.width * 0.5 + 240, gameConfig.scale.height * 0.5 - 120); // Move position for 'On' state
            // this.SoundManager.setSoundEnabled(this.soundEnabled)
        } else {
            onOff.setTexture('offButton');
            onOff.setPosition(gameConfig.scale.width * 0.5 + 160, gameConfig.scale.height * 0.5 - 120); // Move position for 'Off' state
            // this.SoundManager.setSoundEnabled(this.soundEnabled)
        }
    }

    toggleMusic(offMusic: any) {
        // Toggle sound state
        currentGameData.musicMode = !currentGameData.musicMode
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            offMusic.setTexture('onButton');
            offMusic.setPosition(gameConfig.scale.width * 0.5 + 240, gameConfig.scale.height * 0.5 + 50); // Move position for 'On' state
            // this.SoundManager.setMusicEnabled(this.musicEnabled)
        } else {
            offMusic.setTexture('offButton');
            // this.SoundManager.setMusicEnabled(this.musicEnabled);
            offMusic.setPosition(gameConfig.scale.width * 0.5 + 160, gameConfig.scale.height * 0.5 + 50); // Move position for 'Off' state;
        }
    }

    buttonMusic(key: string) {
        // this.SoundManager.playSound(key)
    }
}