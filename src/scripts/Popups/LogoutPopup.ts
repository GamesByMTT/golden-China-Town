import Phaser, {Scene, GameObjects} from "phaser";
import { TextLabel } from "../TextLabel";
import { InteractiveBtn } from "../InteractiveBtn";
import { Globals } from "../Globals";
export default class LogoutPopup extends GameObjects.Container{
    yesBtn!: InteractiveBtn;
    noBtn!: InteractiveBtn
    constructor(scene: Scene){
        super(scene);

         const popupBg = this.scene.add.image(0, 0, 'messagePopupBgImage').setDepth(10);
                popupBg.setOrigin(0.5);
                popupBg.setDisplaySize(1000, 883); // Set the size for your popup background
                popupBg.setAlpha(1); // Set background transparency
              
                // Add text to the popup
                const popupText = new TextLabel(this.scene, 0, -45, "Do you really want \n to quit?", 50, "#000000");
                
                // Yes and No buttons
                const yesButtonSprite = [
                    this.scene.textures.get("yesButton"),
                    this.scene.textures.get("yesButtonHover")
                ];
        
                // Yes and No buttons
                const noButtonSprite = [
                    this.scene.textures.get("noButton"),
                    this.scene.textures.get("noButtonHover")
                ];
                const crossButton = new Phaser.GameObjects.Sprite(this.scene, 300, -250, "exitButton").setInteractive()
                crossButton.on('pointerdown', (pointerdown: Phaser.Input.Pointer)=>{

                    // this.exitBtn.setTexture("normalButton");
                
                    
                })
                this.yesBtn = new InteractiveBtn(this.scene, yesButtonSprite, () => {

                    Globals.Socket?.socket.emit("EXIT", {});
                    window.parent.postMessage("onExit", "*");   
                   
                }, 0, true);
            
                this.noBtn = new InteractiveBtn(this.scene, noButtonSprite, () => {
                    
                 
                    // this.exitBtn.setTexture("normalButton");
                    
                }, 0, true);
               
                this.yesBtn.setPosition(-130, 200).setScale(0.8);
                this.noBtn.setPosition(130, 200).setScale(0.8);
                // Button labels
                // const noText = new TextLabel(this.scene, 130, 75, "No", 30, "#ffffff");
                // const yesText = new TextLabel(this.scene, -130, 75, "Yes", 30, "#ffffff");
                // Add all elements to popupContainer
                this.add([popupBg, popupText, this.yesBtn, this.noBtn, crossButton]);
                // Add popupContainer to the scene
                 
    }
}