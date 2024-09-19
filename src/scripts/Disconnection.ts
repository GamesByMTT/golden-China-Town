import Phaser, { Scene } from "phaser";
import { Globals, initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";

export default class Disconnection extends Scene{
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite
    quit!: Phaser.GameObjects.Sprite
    SceneBg!: Phaser.GameObjects.Sprite
    constructor(){
        super({key: 'Disconnection'})
    }
    create(){
        const { width, height } = this.cameras.main;
        this.pageviewContainer = this.add.container()
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'Background')
        .setDisplaySize(width, height)
        .setDepth(11)
        .setInteractive();
        this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
            pointer.event.stopPropagation();
        })
        this.popupBackground = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width/2, gameConfig.scale.height/2, "settingPopup");
        this.pageviewContainer.add([this.SceneBg, this.popupBackground])

        const disconnectionText = this.add.text( this.popupBackground.x, this.popupBackground.y - 70, "Unable to connect to server", {color: "#920000", fontSize: '50px', stroke: "#4f3130",
            strokeThickness: 1.5, align:"center", wordWrap: { width: 800, useAdvancedWrap: true }})
        disconnectionText.setOrigin(0.5);
        this.quit = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width/2, gameConfig.scale.height/2 + 200, "disconnectClose").setInteractive().setScale(0.8)
        this.quit.on('pointerdown', () => {
            window.parent.postMessage("onExit", "*");   
            Globals.Socket?.socket.emit("EXIT", {});
        })
        this.pageviewContainer.add([this.quit, disconnectionText])
    }
  
}