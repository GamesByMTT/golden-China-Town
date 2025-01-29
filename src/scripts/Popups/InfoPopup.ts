import Phaser, {Scene, GameObjects} from "phaser";
import { Globals, initData, } from "../Globals";

export default class InfoPopup extends GameObjects.Container{
    constructor(scene: Scene){
        super(scene)
    }
}