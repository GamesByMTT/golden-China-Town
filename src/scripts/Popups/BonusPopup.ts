import { GameObjects, Scene } from "phaser";
import { initData, Globals, ResultData } from "../Globals";

export class BonusPopup extends GameObjects.Container{
    constructor(scene: Scene){
        super(scene);
    }
}