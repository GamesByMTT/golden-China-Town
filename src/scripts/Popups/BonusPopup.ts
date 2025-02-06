import { GameObjects, Scene } from "phaser";
import { initData, Globals, ResultData, currentGameData } from "../Globals";
import SoundManager from "../SoundManager";
import { gameConfig } from "../appconfig";
export class BonusPopup extends GameObjects.Container {
    private onCloseCallback?: () => void;
    public bonusContainer!: Phaser.GameObjects.Container
    public spinContainer!: Phaser.GameObjects.Container;
    SoundManager!: SoundManager
    SceneBg!: Phaser.GameObjects.Sprite
    columnLeft!: Phaser.GameObjects.Sprite
    columnRight!: Phaser.GameObjects.Sprite
    roofTop!: Phaser.GameObjects.Sprite
    wheel!: Phaser.GameObjects.Sprite
    Stair!: Phaser.GameObjects.Sprite
    spinWheelBg!: Phaser.GameObjects.Sprite
    spinCircle!: Phaser.GameObjects.Sprite
    spinCenter!: Phaser.GameObjects.Sprite
    startButton!: Phaser.GameObjects.Sprite
    public canSpinBonus: boolean = true;
    winImage!: Phaser.GameObjects.Sprite
    constructor(scene: Scene, config: { onClose?: () => void }) {
        super(scene);
        this.setDepth(1);
        this.onCloseCallback = config.onClose;
        const { width, height } = this.scene.cameras.main;

        const bonusHeading = new Phaser.GameObjects.Text(this.scene, gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.07, "Click on start button to start \n Spin Wheel Bonus Game.", { fontSize: '50px', fontFamily: 'Serat', align: 'center', color: "#b23b00" }).setOrigin(0.5);
        this.SceneBg = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 2, 'Background').setDisplaySize(width, height)
        this.Stair = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 1.08, 'stairs').setDepth(0)
        this.spinWheelBg = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 2 - 40, 'wheelBg').setScale(0.6)

        this.winImage = this.scene.add.sprite(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5, "yourWin")
            .setOrigin(0.5)
            .setAlpha(0)
            .setScale(0);
        // Create the spin circle sprite
        this.spinCircle = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'spinCircle').setScale(0.7);

        // Create a container for the spin circle and numbers
        this.spinContainer = this.scene.add.container(width / 2, height / 2.2, [this.spinCircle]);

        // Set a circular mask for the container to match the spinCircle size
        const maskShape = this.scene.make.graphics({ x: 0, y: 0 });
        maskShape.fillCircle(0, 0, this.spinCircle.width / 2);
        const mask = maskShape.createGeometryMask();
        this.spinContainer.setMask(mask);

        // Create spinCenter with the highest depth
        this.spinCenter = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 2.2, 'spinCenter').setScale(0.5);

        this.startButton = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 1.15, 'freeSpinStartButton').setScale(0.7).setInteractive();

        // Add sprites to the bonusContainer in the correct order
        this.add([
            this.SceneBg,
            bonusHeading,
            this.Stair,
            this.spinWheelBg,
            this.spinCircle,
            this.spinCenter,
            this.startButton
        ]);
        this.spinContainer = this.scene.add.container(width / 2, height / 2.2, [this.spinCircle]);
        this.add([this.spinContainer])

        let segments = initData.gameData.BonusData.length;
        let anglePerSegment = 360 / segments;

        for (let i = 0; i < segments; i++) {
            let startAngle = Phaser.Math.DegToRad(i * anglePerSegment);
            let endAngle = Phaser.Math.DegToRad((i + 1) * anglePerSegment);
            let midAngle = (startAngle + endAngle) / 2;
            let bonusValue = Number(initData.gameData.BonusData[i]);
            let betValue = Number(initData.gameData.Bets[currentGameData.currentBetIndex]);
            let betAmount = (bonusValue * betValue).toFixed(3);

            let text = this.scene.add.text(0, 0, betAmount, { font: "27px", color: "#fff", fontFamily: "Serat" })
            text.setOrigin(0.5);
            text.setPosition(
                120 * Math.cos(startAngle + (endAngle - startAngle) / 2),
                120 * Math.sin(startAngle + (endAngle - startAngle) / 2)
            );
            // Calculate rotation angle (add 90 degrees to make text face center)
            // Calculate rotation to make text readable from outside

            let rotationAngle = (midAngle + Math.PI / 18) - 0.08;
            // Adjust text rotation based on position
            if (midAngle > 0 && midAngle < Math.PI) {
                // Bottom half of wheel
                rotationAngle += Math.PI - 0.08;
            }
            text.setRotation(rotationAngle);

            this.spinContainer.add(text);
        }
        this.spinContainer.angle = 0;
        this.startButton.on("pointerdown", () => {
            if (this.canSpinBonus) {
                if (ResultData.gameData.BonusStopIndex) {
                    this.startButton.setTexture("freeSpinStartButtonPressed")
                    this.spinWheel(ResultData.gameData.BonusStopIndex);
                }
                //else{
                // this.spinWheel(1);
                // }
                // Pass the index you want the wheel to stop at
            }
        })
        this.add(this.winImage)
    }
    spinWheel(targetIndex: number) {
        const spinSound = Globals.soundResources["spinWheelMusic"];
        spinSound.rate(1);  // Ensure starting rate is 1 (normal speed)
        spinSound.play();

        this.canSpinBonus = false;

        let segments = initData.gameData.BonusData.length;
        let anglePerSegment = 360 / segments; // 45 degrees for 8 segments
        let desiredStopAngle = 247.5;  // Your desired stopping angle

        // Calculate the rotation needed to align targetIndex at the desired stop angle
        let targetAngle = (desiredStopAngle - ((targetIndex * anglePerSegment) + (anglePerSegment / 2))) + 22.5;

        // Calculate random spins before landing on target
        let randomSpins = Phaser.Math.Between(2, 5);
        // console.log(randomSpins, "randomSpins");

        let totalRotation = randomSpins * 360 + targetAngle;  // Total rotation including full spins
        // console.log(totalRotation, "totalRotation", targetAngle) ;

        // Spin the wheel
        this.scene.tweens.add({
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
                if (!currentGameData.isAutoSpin) {
                    this.startButton.setInteractive();
                    this.startButton.setTexture("freeSpinStartButton");
                }

                // Add new animation sequence for winImage
                this.scene.tweens.add({
                    targets: this.winImage,
                    scale: { from: 0, to: 2 },    // Scale from 0 to 1
                    alpha: { from: 0, to: 1 },    // Fade in
                    duration: 500,                 // Duration of the animation
                    ease: 'Back.easeOut',         // Use a bouncy ease
                    onComplete: () => {
                        // Optional: Add a small bounce effect after appearing
                        this.scene.tweens.add({
                            targets: this.winImage,
                            scale: 2,            // Slightly larger
                            duration: 100,
                            yoyo: true,            // Go back to original scale
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                // Start the fade out after a delay
                                this.scene.time.delayedCall(2000, () => {
                                    this.scene.tweens.add({
                                        targets: this.winImage,
                                        scale: 0,
                                        alpha: 0,
                                        duration: 300,
                                        ease: 'Back.easeIn',
                                        onComplete: () => {
                                            currentGameData.bonusOpen = false
                                            // this.scene.events.emit("bonusStateChanged", false);
                                            if (this.onCloseCallback) {
                                                this.onCloseCallback();
                                            }
                                            this.scene.events.emit("closePopup");
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}