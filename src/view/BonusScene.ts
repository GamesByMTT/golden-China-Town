import Phaser, { Scene } from "phaser";
import { Globals, initData, ResultData } from "../scripts/Globals";
import { gameConfig } from "../scripts/appconfig";
import SoundManager from "../scripts/SoundManager";
let values = initData.gameData.BonusData
export default class BonusScene extends Scene{
    public bonusContainer!: Phaser.GameObjects.Container
   public spinContainer!: Phaser.GameObjects.Container;
   SoundManager!: SoundManager
   SceneBg!: Phaser.GameObjects.Sprite
    columnLeft!: Phaser.GameObjects.Sprite
    columnRight!: Phaser.GameObjects.Sprite
    roofTop!: Phaser.GameObjects.Sprite
    wheel!: Phaser.GameObjects.Sprite
    Stair!: Phaser.GameObjects.Sprite
    snow!: Phaser.GameObjects.Sprite
    spinWheelBg!: Phaser.GameObjects.Sprite
    spinCircle!: Phaser.GameObjects.Sprite
    spinCenter!: Phaser.GameObjects.Sprite
    startButton!: Phaser.GameObjects.Sprite
    public canSpinBonus: boolean = true;
    constructor() {
        super({ key: 'BonusScene' });
    }
    create(){
        // console.log(values, "values");
        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width/2, height/2, 'Background').setDisplaySize(width, height)
        this.Stair = new Phaser.GameObjects.Sprite(this, width/2, height/1.08, 'stairs').setDepth(0)
        this.spinWheelBg = new Phaser.GameObjects.Sprite(this, width/2, height/2 - 40, 'wheelBg').setScale(0.6)
        // Create the spin circle sprite
        this.spinCircle = new Phaser.GameObjects.Sprite(this, 0, 0, 'spinCircle').setScale(0.7).setDepth(0);
         
        // Create a container for the spin circle and numbers
        this.spinContainer = this.add.container(width / 2, height / 2.2, [this.spinCircle]);
     
        // Set a circular mask for the container to match the spinCircle size
        const maskShape = this.make.graphics({ x: 0, y: 0 });
        maskShape.fillCircle(0, 0, 4000);
        const mask = maskShape.createGeometryMask();
        this.spinContainer.setMask(mask);
       
        // Create spinCenter with the highest depth
        this.spinCenter = new Phaser.GameObjects.Sprite(this, width/2, height/2.2, 'spinCenter').setScale(0.5).setDepth(2);
        
        this.startButton = new Phaser.GameObjects.Sprite(this, width/2, height/1.15, 'freeSpinStartButton').setScale(0.7).setInteractive();
      
        // Add sprites to the bonusContainer in the correct order
        this.bonusContainer.add([
            this.SceneBg,
            this.Stair,
            this.spinWheelBg,
            this.spinContainer,
            this.spinCenter,
            this.startButton
        ]);
     
       
        let segments = initData.gameData.BonusData.length;
        let anglePerSegment = 360 / segments;
        
        for(let i=0; i< segments; i++){
            let startAngle = Phaser.Math.DegToRad(i * anglePerSegment);
            let endAngle = Phaser.Math.DegToRad((i + 1) * anglePerSegment);
            // this.spinCircle.slice(0, 0, 200, startAngle, endAngle, false);
            let text = this.add.text(0, 0, initData.gameData.BonusData[i], { font: "20px Arial", color: "#fff" });
            text.setOrigin(0.5);
            text.setPosition(
                120 * Math.cos(startAngle + (endAngle - startAngle) / 2),
                120 * Math.sin(startAngle + (endAngle - startAngle) / 2)
            );
            this.spinContainer.add(text);
        }
        this.spinContainer.angle = 0;
        this.startButton.on("pointerdown", ()=>{
            if (this.canSpinBonus) {
                 if(ResultData.gameData.BonusStopIndex){
                    this.startButton.setTexture("freeSpinStartButtonPressed")
                    this.spinWheel(ResultData.gameData.BonusStopIndex);
                 }
            }
        })
      }
      spinWheel(targetIndex: number) {
        const spinSound = Globals.soundResources["spinWheelMusic"];
        spinSound.rate(1);  // Ensure starting rate is 1 (normal speed)
        // spinSound.play();
        
        this.canSpinBonus = false;
        
        let segments = initData.gameData.BonusData.length;
        let anglePerSegment = 360 / segments; // 45 degrees for 8 segments
        let desiredStopAngle = 247.5;  // Your desired stopping angle
    
        // Calculate the rotation needed to align targetIndex at the desired stop angle
        let targetAngle = (desiredStopAngle - ((targetIndex * anglePerSegment) + (anglePerSegment / 2))) + 22.5;
    
        // Calculate random spins before landing on target
        let randomSpins = Phaser.Math.Between(2, 5);
        
        let totalRotation = randomSpins * 360 + targetAngle;  // Total rotation including full spins
        // console.log(totalRotation, "totalRotation", targetAngle) ;
        
        // Spin the wheel
        this.tweens.add({
            targets: this.spinContainer,
            angle: totalRotation,
            ease: 'Back.easeOut',
            duration: 5000,
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                // Gradually slow down the spin sound as the wheel slows down
                if (progress > 0.5) {
                    const newRate = 1 - ((progress - 0.7) * 2);  // Decrease rate to slow down
                    spinSound.rate(Phaser.Math.Clamp(newRate, 0.5, 1));  // Ensure rate doesn't go below 0.5
                }
            },
            onComplete: () => {
                spinSound.rate(0.5);
                spinSound.stop();
    
                this.startButton.setInteractive();
                this.startButton.setTexture("freeSpinStartButton");
                
                setTimeout(() => {
                    Globals.SceneHandler?.removeScene("BonusScene");
                }, 2000);
            }
        });
    }
    
}
