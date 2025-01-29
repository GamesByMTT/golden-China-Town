import Phaser, { GameObjects, Scene } from "phaser";
import { DisconnectionPopup } from "./Popups/Disconnection";
import InfoPopup from "./Popups/InfoPopup";
import LogoutPopup from "./Popups/LogoutPopup";
import { BonusPopup } from "./Popups/BonusPopup";

export class PopupManager {
    private scene: Scene;
    private popupContainer: GameObjects.Container;
    private overlay: Phaser.GameObjects.Rectangle;
    private currentPopup: InfoPopup | BonusPopup | InfoPopup | LogoutPopup | null = null

    constructor(scene: Scene){
        this.scene = scene;
        this.popupContainer = this.scene.add.container(0, 0);
        this.popupContainer.setDepth(1000);

        this.overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.7).setInteractive();
        this.overlay.setOrigin(0);
        this.overlay.setDepth(0);

        this.overlay.on("ponterdown", ()=>{
            scene.events.emit("closePopup")
        })
        this.popupContainer.add(this.overlay)
        this.popupContainer.setVisible(false)
        this.scene.events.on("closePopup", this.closeCurrentPopup, this)
    }

    showInfoPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new InfoPopup(this.scene);
        this.popupContainer.add(this.currentPopup);
        this.popupContainer.setVisible(true);
    }

    showBonusPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new BonusPopup(this.scene);
        this.popupContainer.add(this.currentPopup);
        this.popupContainer.setVisible(true)
    }

    showDisconnectionPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new DisconnectionPopup(this.scene);
        this.popupContainer.add(this.currentPopup);
        this.popupContainer.setVisible(true);
    }

    showLogoutPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new LogoutPopup(this.scene);
        this.popupContainer.add(this.currentPopup);
        this.popupContainer.setVisible(true);
    }

    closeCurrentPopup() {
        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
        this.popupContainer.setVisible(false);
    }
}