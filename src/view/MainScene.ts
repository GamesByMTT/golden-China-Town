import { Scene, GameObjects, Scale } from 'phaser';
import { Slots } from '../scripts/Slots';
import { UiContainer } from '../scripts/UiContainer';
import { LineGenerator, Lines } from '../scripts/Lines';
import { UiPopups } from '../scripts/UiPopup';
import LineSymbols from '../scripts/LineSymbols';
import { Globals, ResultData, currentGameData, initData } from '../scripts/Globals';
import { gameConfig } from '../scripts/appconfig';
import BonusScene from './BonusScene';
import SoundManager from '../scripts/SoundManager';

export default class MainScene extends Scene {
    slot!: Slots;
    Background!: Phaser.GameObjects.Sprite
    slotFrame!: Phaser.GameObjects.Sprite;
    stairs!: Phaser.GameObjects.Sprite;
    reelBg!: Phaser.GameObjects.Sprite
    columnleft!: Phaser.GameObjects.Sprite
    columnRight!: Phaser.GameObjects.Sprite
    roofTop!: Phaser.GameObjects.Sprite
    snow!: Phaser.GameObjects.Sprite  
    lineGenerator!: LineGenerator;
    soundManager!: SoundManager
    uiContainer!: UiContainer;
    uiPopups!: UiPopups;
    lineSymbols!: LineSymbols
    onSpinSound!: Phaser.Sound.BaseSound
    logo!: Phaser.GameObjects.Sprite
    private mainContainer!: Phaser.GameObjects.Container;
    constructor() {
        super({ key: 'MainScene' });
    }
    /**
     * @method create method used to create scene and add graphics respective to the x and y coordinates
     */
    create() {
        console.log("MainScene Create");
        
        // Set up the background
        const { width, height } = this.cameras.main;
        // Initialize main container
        const bbgOverLay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffffff, 0.25).setOrigin(0)
        this.mainContainer = this.add.container();
        this.soundManager = new SoundManager(this)
       
        this.Background = new Phaser.GameObjects.Sprite(this, width/2, height/2, "Background")
        // Set up the stairs frame
        this.stairs = new Phaser.GameObjects.Sprite(this, width/2, height/1.02, 'stairs')
        // this.reelBg = new Phaser.GameObjects.Sprite(this, width/2, height/2.2, 'reelBg').setDepth(0)
        this.roofTop = new Phaser.GameObjects.Sprite(this, width/2, height * 0.08, 'roof')
        this.columnleft = new Phaser.GameObjects.Sprite(this, width/4.3, height/2.2, 'column')
        this.columnRight = new Phaser.GameObjects.Sprite(this, width/1.31, height/2.2, 'column')
        this.logo = new Phaser.GameObjects.Sprite(this, width/2, height/2 - 400, "GoldenChinaTown")

        // Repeat reelBg 4 times
        const reelBgCount = 5;
        const reelBgSpacing = 160; // Adjust this value to set the spacing between reelBg sprites
        for (let i = 0; i < reelBgCount; i++) {
            const reelBgX = width / 3 + i * reelBgSpacing; // or any specific x-coordinate
            const reelBgY = height / 2;
            const reelBg = new Phaser.GameObjects.Sprite(this, reelBgX, reelBgY, 'reelBg').setDepth(2);
            this.mainContainer.add(reelBg);
        }
        const leftPlank = new Phaser.GameObjects.Sprite(this, this.columnleft.x + 114,height/1.9, "leftPlank").setScale(0.9)
        const rightPlank = new Phaser.GameObjects.Sprite(this, this.columnRight.x - 104, height/1.9, "rightPlank").setScale(0.9);
        const topPlank = new Phaser.GameObjects.Sprite(this, width/2, height/2 - 270, "topPlank").setScale(0.73);
        const bottomPlank = new Phaser.GameObjects.Sprite(this, width/2, height/1.30, "bottomPlank").setScale(0.8)
        const up = new Phaser.GameObjects.Sprite(this, width/2, this.roofTop.height + 15, "upPlnak")
        const leftLanterns = new Phaser.GameObjects.Sprite(this, this.columnleft.x - 100, height/2 - 400, "leftLanterns").setOrigin(0.5)
        const rightLanterns = new Phaser.GameObjects.Sprite(this, this.columnRight.x + 100, height/2 - 400, "rightLanterns").setOrigin(0.5)

        // this.snow = new Phaser.GameObjects.Sprite(this, width/2, height/2.4, 'snow')
        
        this.mainContainer.add([this.stairs, up, this.columnleft, this.columnRight, leftPlank, rightPlank, bottomPlank, topPlank, this.roofTop,leftLanterns, rightLanterns, this.logo])
        this.soundManager.playSound("backgroundMusic")

        // Initialize UI Container
        this.uiContainer = new UiContainer(this, () => this.onSpinCallBack(), this.soundManager);
        this.mainContainer.add(this.uiContainer);
        // // Initialize Slots
        this.slot = new Slots(this, this.uiContainer,() => this.onResultCallBack(), this.soundManager);

        // Initialize payLines
        this.lineGenerator = new LineGenerator(this, this.slot.slotSymbols[0][0].symbol.height, this.slot.slotSymbols[0][0].symbol.width).setScale(0.8, 0.8);
        this.mainContainer.add([this.lineGenerator, this.slot]);

        // Initialize UI Popups
        this.uiPopups = new UiPopups(this, this.uiContainer, this.soundManager);
        this.mainContainer.add(this.uiPopups)

        // Initialize LineSymbols
        this.lineSymbols = new LineSymbols(this, 10, 12, this.lineGenerator)
        this.mainContainer.add(this.lineSymbols)
    }

    update(time: number, delta: number) {
        this.slot.update(time, delta);
    }

    /**
     * @method onResultCallBack Change Sprite and Lines
     * @description update the spirte of Spin Button after reel spin and emit Lines number to show the line after wiining
     */
    onResultCallBack() {
        const onSpinMusic = "onSpin"
        this.uiContainer.onSpin(false);
        this.soundManager.stopSound(onSpinMusic)
        this.lineGenerator.showLines(ResultData.gameData.linesToEmit);
    }
    /**
     * @method onSpinCallBack Move reel
     * @description on spin button click moves the reel on Seen and hide the lines if there are any
     */
    onSpinCallBack() {
        const onSpinMusic = "onSpin"
        this.soundManager.playSound(onSpinMusic)
        this.slot.moveReel();
        this.lineGenerator.hideLines();
    }

    /**
     * @method recievedMessage called from MyEmitter
     * @param msgType ResultData
     * @param msgParams any
     * @description this method is used to update the value of textlabels like Balance, winAmount freeSpin which we are reciving after every spin
     */
    recievedMessage(msgType: string, msgParams: any) {
        if (msgType === 'ResultData') {
            this.time.delayedCall(1000, () => {    
                if (ResultData.gameData.isBonus) {
                    setTimeout(() => {
                        Globals.SceneHandler?.addScene('BonusScene', BonusScene, true)
                    }, 2000);
                }         
                this.uiContainer.currentWiningText.updateLabelText(ResultData.playerData.currentWining.toFixed(2));
                currentGameData.currentBalance = ResultData.playerData.Balance;
                let betValue = (initData.gameData.Bets[currentGameData.currentBetIndex]) * 20
                let jackpot = ResultData.gameData.jackpot
                let winAmount = ResultData.gameData.WinAmout;   
                this.uiContainer.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                const freeSpinCount = ResultData.gameData.freeSpins.count;
                // const freeSpinCount = 5;
                // Check if freeSpinCount is greater than 1
                if (freeSpinCount >=1) {
                    this.freeSpinPopup(freeSpinCount, 'freeSpinPopup')
                    this.uiContainer.freeSpininit(freeSpinCount)
                    this.tweens.add({
                        targets: this.uiContainer.freeSpinText,
                        scaleX: 1.3, 
                        scaleY: 1.3, 
                        duration: 800, // Duration of the scale effect
                        yoyo: true, 
                        repeat: -1, 
                        ease: 'Sine.easeInOut' // Easing function
                    });
                } else {
                    // If count is 1 or less, ensure text is scaled normally
                    this.uiContainer.freeSpininit(freeSpinCount)
                }
                if (winAmount >= 10 * betValue && winAmount < 15 * betValue) {
                 // Big Win Popup
                 this.showWinPopup(winAmount, 'bigWinPopup')
                } else if (winAmount >= 15 * betValue && winAmount < 20 * betValue) {
                    // HugeWinPopup
                    this.showWinPopup(winAmount, 'hugeWinPopup')
                } else if (winAmount >= 20 * betValue && winAmount < 25 * betValue) {
                    //MegawinPopup
                    this.showWinPopup(winAmount, 'megaWinPopup')
                } else if(jackpot > 0) {
                   //jackpot Condition
                   this.showWinPopup(winAmount, 'jackpotPopup')
                }
                this.slot.stopTween();
            });
        }
    }

    /**
     * @method showWinPopup
     * @description Displays a popup showing the win amount with an increment animation and different sprites
     * @param winAmount The amount won to display in the popup
     * @param spriteKey The key of the sprite to display in the popup
     */
    showWinPopup(winAmount: number, spriteKey: string) {
        // Create the popup background
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2a1820, 0.95)
        .setOrigin(0, 0)
        .setDepth(9) // Set depth to be below the popup but above game elements
        .setInteractive() // Make it interactive to block all input events
        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Prevent default action on pointerdown to block interaction
            pointer.event.stopPropagation();
        });
        let winSprite: any
        if(spriteKey === "jackpotPopup"){
            winSprite = this.add.sprite(this.cameras.main.centerX - 125, this.cameras.main.centerY - 250, spriteKey).setDepth(11);
        }else if(spriteKey === "hugeWinPopup"){
            winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 120, spriteKey).setDepth(11);
        } else{
            winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 50, spriteKey).setDepth(11);
        }
      
        // Create the text object to display win amount
        const winText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '0', {
            font: '45px',
            color: '#000000'
        }).setDepth(11).setOrigin(0.5);

        // Tween to animate the text increment from 0 to winAmount
        this.tweens.addCounter({
            from: 0,
            to: winAmount,
            duration: 500, // Duration of the animation in milliseconds
            onUpdate: (tween) => {
                const value = Math.floor(tween.getValue());
                winText.setText(value.toString());
            },
            onComplete: () => {
                // Automatically close the popup after a few seconds
                this.time.delayedCall(4000, () => {
                    inputOverlay.destroy();
                    winText.destroy();
                    winSprite.destroy();
                });
            }
        });
    }

    /**
     * @method freeSpinPopup
     * @description Displays a popup showing the win amount with an increment animation and different sprites
     * @param freeSpinCount The amount won to display in the popup
     * @param spriteKey The key of the sprite to display in the popup
     */
    freeSpinPopup(freeSpinCount: number, spriteKey: string) {
        console.log(this.uiContainer.isAutoSpinning, "AutoSpinCheck");
        
        // Create the popup background
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x2a1820, 0.95)
        .setOrigin(0, 0)
        .setDepth(9) // Set depth to be below the popup but above game elements
        .setInteractive() // Make it interactive to block all input events
        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Prevent default action on pointerdown to block interaction
            pointer.event.stopPropagation();
        });
        // Create the sprite based on the key provided
        const winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, spriteKey).setDepth(11);
        if(!this.uiContainer.isAutoSpinning){
        }
        // Create the text object to display win amount
        const freeText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '0', {
            font: '45px',
            color: '#000000'
        }).setDepth(11).setOrigin(0.5);
        // Tween to animate the text increment from 0 to winAmount
        this.tweens.addCounter({
            from: 0,
            to: freeSpinCount,
            duration: 200, // Duration of the animation in milliseconds
            onUpdate: (tween) => {
                const value = Math.floor(tween.getValue());
                freeText.setText(value.toString());
            },
            onComplete: () => {
                const startButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY + 80, 'freeSpinStartButton').setDepth(11).setScale(0.5, 0.5).setInteractive();
                startButton.on("pointerdown", () => {
                            inputOverlay.destroy();
                            freeText.destroy();
                            winSprite.destroy();
                            startButton.destroy();
                            Globals.Socket?.sendMessage("SPIN", { currentBet: currentGameData.currentBetIndex, currentLines: 20, spins: 1 });
                            currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                            // this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                            this.onSpinCallBack();
                });
                if(this.uiContainer.isAutoSpinning){
                this.time.delayedCall(3000, () => {
                    inputOverlay.destroy();
                    freeText.destroy();
                    winSprite.destroy();
                });
                }
            }
        });
    }

   
}
