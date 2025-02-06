import Phaser from 'phaser';
import { Scene, GameObjects, Types } from 'phaser';
import { Globals, ResultData, currentGameData, initData } from './Globals';
import { TextLabel } from './TextLabel';
import { gameConfig } from './appconfig';
import MainScene from '../view/MainScene';
import SoundManager from './SoundManager';
import { InteractiveBtn } from './InteractiveBtn';
import { PopupManager } from './PopupManager';
// Define UiContainer as a Phaser Scene class
export class UiContainer extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    popupManager: PopupManager
    spinBtn!: Phaser.GameObjects.Sprite;
    maxbetBtn!: Phaser.GameObjects.Sprite;
    autoBetBtn!: Phaser.GameObjects.Sprite;
    freeSpinBgImg!: Phaser.GameObjects.Sprite
    fireAnimation: Phaser.GameObjects.Sprite[] = [];
    CurrentBetText!: TextLabel;
    currentWiningText!: TextLabel;
    currentBalanceText!: TextLabel;
    CurrentLineText!: TextLabel;
    freeSpinText!: TextLabel;
    pBtn!: Phaser.GameObjects.Sprite;
    mBtn!: Phaser.GameObjects.Sprite
    settingBtn!: InteractiveBtn;
    rulesBtn!: InteractiveBtn;
    infoBtn!: InteractiveBtn;
    exitBtn!: InteractiveBtn
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    mainScene!: Phaser.Scene
    fireSprite1!: Phaser.GameObjects.Sprite
    fireSprite2!: Phaser.GameObjects.Sprite
    betButtonDisable!: Phaser.GameObjects.Container
    freeSpinContainer!: Phaser.GameObjects.Container
    spinButtonSound!: Phaser.Sound.BaseSound
    normalButtonSound!: Phaser.Sound.BaseSound
    turboSprite!: Phaser.GameObjects.Sprite;
    turboMode: boolean = false
    turboAnimation: Phaser.Types.Animations.AnimationFrame[] = []
    stopButton!: GameObjects.Sprite
    public isSpinning: boolean = false

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        scene.add.existing(this); 
        this.popupManager = new PopupManager(scene);
        // Initialize UI elements
        this.maxBetInit();
        this.autoSpinBtnInit(spinCallBack);
        this.spinBtnInit(spinCallBack);
        
        this.lineBtnInit();
        this.winBtnInit();
        this.balanceBtnInit();
        this.BetBtnInit();
        this.settingBtnInit();
        this.infoBtnInit();
        this.exitButton()
        this.turboButton();
        this.stopSpinButton()
        this.SoundManager = soundManager;
        this.scene.events.on("freeSpin", () => this.freeSpinStart(spinCallBack), this)
        this.scene.events.on("updateWin", this.updateData, this)
        this.scene.events.on("stopButtonStateChange", this.hideStopButton, this)
        // this.scene.events.on("feeSpinPopup", this.freeSpinPopupShow, this)
        // this.freeSpininit();
        // this.vaseInit();
    }

     //turbo Button
     turboButton(){
        const container = this.scene.add.container(gameConfig.scale.width * 0.85, gameConfig.scale.height * 0.68)
        this.turboSprite = this.scene.add.sprite(0, 0, "turboSpin").setOrigin(0.5).setScale(0.5).setInteractive()
       
        this.turboSprite.on("pointerdown", ()=>{
            this.turboSprite.setScale(0.55)
            this.addFrames()
            currentGameData.turboMode = !currentGameData.turboMode
            if(currentGameData.turboMode){
                this.turboSprite.play('turboSpin')
            }else{
                this.turboSprite.stop()
                this.turboAnimation = []
                this.turboSprite.setTexture('turboSpin')
            }
        })
        this.turboSprite.on("pointerup", ()=>{
            this.turboSprite.setScale(0.58)
        })
        container.add([this.turboSprite])
    }
    addFrames(){
        for(let p = 0; p < 40; p++){
            this.turboAnimation.push({key: `turboButton${p}`});
        }
        this.scene.anims.create({
            key: 'turboSpin',
            frames: this.turboAnimation,
            frameRate: 40,
            repeat: -1
        })
    }

    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const container = this.scene.add.container(gameConfig.scale.width/6, this.maxbetBtn.y);
        // const lineText = new TextLabel(this.scene, -20, -70, "LINES", 30, "#3C2625");
        const linePanel = this.scene.add.sprite(0, 0, "lines").setDepth(0);
        linePanel.setOrigin(0.5);
        linePanel.setPosition(gameConfig.scale.width/6, this.maxbetBtn.y);
        this.CurrentLineText = new TextLabel(this.scene, 0, 15, initData.gameData.Lines.length.toString(), 35, "#ffffff");
        //Line Count
        container.add(this.CurrentLineText).setDepth(1)
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const winPanel = this.scene.add.sprite(0, 0, 'winPanel');
        winPanel.setOrigin(0.5);
        // winPanel.setScale(0.8, 0.8)
        winPanel.setPosition(gameConfig.scale.width / 3.35, this.maxbetBtn.y);
        const currentWining: any = ResultData.playerData.currentWining;
       
        this.currentWiningText = new TextLabel(this.scene, 0, 15, currentWining.toFixed(2), 35, "#FFFFFF");
        const winPanelChild = this.scene.add.container(winPanel.x, winPanel.y)
        winPanelChild.add(this.currentWiningText);
        if(currentWining > 0){
            console.log(currentWining, "currentWining");
            this.scene.tweens.add({
                targets:  this.currentWiningText,
                scaleX: 1.3, 
                scaleY: 1.3, 
                duration: 800, // Duration of the scale effect
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' // Easing function
            });
        }
    }
    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const balancePanel = this.scene.add.sprite(0, 0, 'balancePanel');
        balancePanel.setOrigin(0.5);
        // balancePanel.setPosition(gameConfig.scale.width / 1.2, this.maxbetBtn.y);
        balancePanel.setPosition(gameConfig.scale.width/1.4, this.maxbetBtn.y)
        const container = this.scene.add.container(balancePanel.x, balancePanel.y);
        // balancePanel.setScale(0.8)
        // container.add(balancePanel);
        currentGameData.currentBalance = initData.playerData.Balance;
        this.currentBalanceText = new TextLabel(this.scene, 0, 15, currentGameData.currentBalance.toFixed(2), 35, "#ffffff");
        container.add(this.currentBalanceText);
    }

    /**
     * @method stopSpinButton stop button functionality
     * @description this method draw stop button when spin button is pressed
     */
    stopSpinButton(){
        const container = this.scene.add.container(gameConfig.scale.width * 0.5, gameConfig.scale.height - 130)
        this.stopButton = this.scene.add.sprite(0, 0, "stopButton").setInteractive().setVisible(false)
        this.stopButton.on("pointerdown", ()=>{
            currentGameData.stopButtonEnabled = !currentGameData.stopButtonEnabled
            this.scene.events.emit("stopImmediately")
        })
        container.add(this.stopButton)
    }
    /**
     * @method spinBtnInit Spin the reel
     * @description this method is used for creating and spin button and on button click the a SPIn emit will be triggered to socket and will deduct the amout according to the bet
     */
    spinBtnInit(spinCallBack: () => void) {
        this.spinBtn = this.createButton('spinBtn', gameConfig.scale.width / 2, gameConfig.scale.height - 130, () => {
        // this.spinButtonSound = this.scene.sound.add("spinButton", {loop: false, volume: 0.8})
        this.buttonMusic("spinButton");
        // checking if autoSpining is working or not if it is auto Spining then stop it
        if(currentGameData.isAutoSpin){
            currentGameData.isAutoSpin = !currentGameData.isAutoSpin
            return;
        }
        const balance = parseFloat(this.currentBalanceText.text);
        const balanceendValue = balance - (initData.gameData.Bets[currentGameData.currentBetIndex] * initData.gameData.Lines.length);
        // Create the tween
        this.scene.tweens.add({
            targets: { value: balance },
            value: balanceendValue,
            duration: 500, // Duration in milliseconds
            ease: 'Linear',
            onUpdate: (tween) => {
                // Update the text during the tween
                const currentBalance = tween.getValue();
                this.currentBalanceText.updateLabelText(currentBalance.toFixed(3).toString());
            },
            onComplete: () => {
                // Ensure final value is exact
                this.currentBalanceText.updateLabelText(balanceendValue.toFixed(3).toString());
            }
        });
    // tween added to scale transition
        this.scene.tweens.add({
            targets: this.spinBtn,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            onComplete: () => {
                this.startSpining(spinCallBack)
                // Scale back to original size 
                this.scene.tweens.add({
                    targets: this.spinBtn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    onComplete: () => {
                        
                    }
                });
                // 
            }
        });
        });

    }

    /**
     * @method autoSpinBtnInit 
     * @param spinCallBack 
     * @description crete and auto spin button and on that spin button click it change the sprite and called a recursive function and update the balance accroding to that
     */
      autoSpinBtnInit(spinCallBack: () => void) {
        this.autoBetBtn = this.scene.add.sprite(gameConfig.scale.width * 0.57, gameConfig.scale.height * 0.88, "autoSpin");

        const autoPlay = [
            this.scene.textures.get("autoSpin"),
            this.scene.textures.get("autoSpin")
        ]
        this.autoBetBtn = new InteractiveBtn(this.scene, autoPlay, ()=>{
            currentGameData.isAutoSpin = !currentGameData.isAutoSpin
            if(!currentGameData.isAutoSpin){
                this.isSpinning = false
                return
            }else{
                this.buttonMusic("buttonpressed")
                this.freeSpinStart(spinCallBack)
            }
        }, 7, true);
        
    }

    freeSpinStart(spinCallBack: () => void){
        currentGameData.bonusOpen = false
        if(currentGameData.isAutoSpin || ResultData.gameData.freeSpins.count > 0){
            if(ResultData.gameData.freeSpins.count > 0){
                
            }
            this.isSpinning = true;
            this.onSpin(true)
            Globals.Socket?.sendMessage("SPIN", { 
                currentBet: currentGameData.currentBetIndex, 
                currentLines: initData.gameData.Lines.length, 
                spins: 1 
            });
            spinCallBack();
        }
        
            // Reset the flag after some time or when spin completes
        // setTimeout(() => {
        //     this.isSpinning = false;
        // }, 1200); // Adjust timeout as needed
    }

    /**
     * @method maxBetBtn used to increase the bet amount to maximum
     * @description this method is used to add a spirte button and the button will be used to increase the betamount to maximun example on this we have twenty lines and max bet is 1 so the max bet value will be 1X20 = 20
     */
    maxBetInit() {
        this.maxbetBtn =  new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'maxBetBtn');
        // gameConfig.scale.width / 1.2, this.maxbetBtn.y
        this.maxbetBtn = this.createButton('maxBetBtn', gameConfig.scale.width / 2 - this.maxbetBtn.width / 1.7, gameConfig.scale.height - this.maxbetBtn.height - 5 , () => {
            if (this.SoundManager) {
                this.buttonMusic("buttonpressed");
            }
            this.scene.tweens.add({
                targets: this.maxbetBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: ()=>{
                    this.maxbetBtn.setTexture("maxBetBtOnPressed")
                    this.maxbetBtn.disableInteractive()
                    currentGameData.currentBetIndex = initData.gameData.Bets[initData.gameData.Bets.length - 1];
                    this.CurrentBetText.updateLabelText((currentGameData.currentBetIndex*20).toString());
                    // this.CurrentLineText.updateLabelText(initData.gameData.Bets[initData.gameData.Bets.length - 1]);
                    this.scene.tweens.add({
                        targets: this.maxbetBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.maxbetBtn.setTexture("maxBetBtn");
                            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        
        }).setDepth(0);      
    }
    /**
     * @method BetBtnInit 
     * @description this method is used to create the bet Button which will show the totla bet which is placed and also the plus and minus button to increase and decrese the bet value
     */
    BetBtnInit() {
        // gameConfig.scale.width / 1.2
        const container = this.scene.add.container(gameConfig.scale.width / 1.127, this.maxbetBtn.y);
        this.betButtonDisable = container    
        const betPanel = this.scene.add.sprite(0, 0, 'BetPanel').setOrigin(0.5).setDepth(4);
        container.add(betPanel);
        this.pBtn = this.createButton('pBtn', 100, 3, () => {
            this.buttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * 20;
                // this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(0);
        container.add(this.pBtn);
        this.mBtn = this.createButton('mBtn', -100, 3, () => {
            this.buttonMusic("buttonpressed");
            this.mBtn.setTexture('mBtnH');
            this.mBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex--;
                if (currentGameData.currentBetIndex <= 0) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * 20;
                // this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.mBtn.setTexture('mBtn');
                this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(0);
        container.add(this.mBtn);
        this.CurrentBetText = new TextLabel(this.scene, 0, 15, ((initData.gameData.Bets[currentGameData.currentBetIndex]) * 20).toString(), 35, "#FFFFFF").setDepth(6);
        container.add(this.CurrentBetText);
    }

    /**
     * @method freeSpininit 
     * @description this method is used for showing the number of freeSpin value at the top of reels
     */
    freeSpininit(freeSpinNumber: number){
        if(freeSpinNumber == 0){
            if(this.freeSpinBgImg){
                this.freeSpinBgImg.destroy();
                this.freeSpinText.destroy()
                this.freeSpinContainer.destroy();
            }   
        }
        if(freeSpinNumber >= 1){

        }else{
           
        }
    }

    // freeSpinPopupShow(){
    //     this.freeSpinText.updateLabelText((ResultData.gameData.freeSpins.count).toString())
    //     if(ResultData.gameData.freeSpins.count > 0){
    //         if(currentGameData.freeSpinPopup){

    //         }else{
    //             currentGameData.freeSpinPopup = true
    //             // this.freeSpinConatiner.setVisible(true)
    //             // this.scene.time.delayedCall(1000, ()=>{
    //             //     this.scene.tweens.add({
    //             //         targets: this.freeSpinConatiner,
    //             //         scale: {from: 1, to: 0.4},
    //             //         x: {from: this.freeSpinConatiner.x, to: gameConfig.scale.width * 0.1},
    //             //         y: {from: this.freeSpinConatiner.y, to: gameConfig.scale.height * 0.32},
    //             //         duration: 700,
    //             //         ease: "Back.easeOut"
    //             //     })
    //             // })
                
    //         }
    //     }else{
    //         this.scene.time.delayedCall(1000, ()=>{
    //             currentGameData.freeSpinPopup = false;
    //             // this.freeSpinConatiner.setPosition(gameConfig.scale.width / 2, gameConfig.scale.height/2)
    //             // this.freeSpinConatiner.setScale(1)
    //             // this.freeSpinConatiner.setVisible(false);
    //         })
    //     }        
    // }

    startSpining(spinCallBack: () => void){
        if(!currentGameData.turboMode){
            this.stopButton.setVisible(true)
        }
        this.isSpinning = true;
        this.onSpin(true)
        Globals.Socket?.sendMessage("SPIN", { 
                currentBet: currentGameData.currentBetIndex, 
                currentLines: initData.gameData.Lines.length, 
                spins: 1 
        });
        spinCallBack();
        // Reset the flag after some time or when spin completes
        setTimeout(() => {
            this.isSpinning = false;
        }, 1200); // Adjust timeout as needed
    }
    /**
     * @method startSpinRecursion
     * @param spinCallBack 
     */
    startSpinRecursion(spinCallBack: () => void) {
        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
            // this.startFireAnimation();
            // Delay before the next spin
            const delay = currentGameData.isMoving && (ResultData.gameData.symbolsToEmit.length > 0) ? 3000 : 5000;
            this.scene.time.delayedCall(delay, () => {
                if (this.isAutoSpinning && currentGameData.currentBalance >= 0) {
                    Globals.Socket?.sendMessage("SPIN", {
                        currentBet: currentGameData.currentBetIndex,
                        currentLines : 20
                    });
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    spinCallBack();
                    // Call the spin recursively
                    this.spinRecursively(spinCallBack);
                }
            });
        }
    }

    spinRecursively(spinCallBack: () => void) {
        if (this.isAutoSpinning) {
            // Perform the spin
            this.autoSpinRec(true);
            if (currentGameData.currentBalance < initData.gameData.Bets[currentGameData.currentBetIndex]) {
                // Stop the spin when a winning condition is met or balance is insufficient
                this.autoSpinRec(false);
                spinCallBack();
            } else {
                // Continue spinning if no winning condition is met and balance is sufficient
                this.startSpinRecursion(spinCallBack);
            }
        }
    }
    
    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        // button.setScale(0.9)
        button.on('pointerdown', callback);
        return button;
    }
   
    autoSpinRec(spin: boolean){
        if(spin){
            this.spinBtn.setTexture("spinBtnOnPressed");
            this.autoBetBtn.setTexture("autoSpinOnPressed");
            this.maxbetBtn.disableInteractive();
            this.pBtn.disableInteractive();
            this.mBtn.disableInteractive();
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.autoBetBtn.setTexture("autoSpin");
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
        }        
    }

    onSpin(spin: boolean) {
        // Handle spin functionality
        if(this.isAutoSpinning){
            return
        }
        if(spin){
            this.spinBtn.disableInteractive();
            this.spinBtn.setTexture("spinBtnOnPressed");
            this.autoBetBtn.setTexture("autoSpinOnPressed");
            this.autoBetBtn.disableInteractive();
            this.maxbetBtn.disableInteractive();
            this.pBtn.disableInteractive();
            this.mBtn.disableInteractive();
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.autoBetBtn.setTexture("autoSpin");
            this.autoBetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
        }        
    }

     settingBtnInit() {
            const settingBtnSprites = [
                this.scene.textures.get('settingBtn'),
                this.scene.textures.get('settingBtnH')
            ];
            this.settingBtn = new InteractiveBtn(this.scene, settingBtnSprites, () => {
                this.buttonMusic("buttonpressed")
                this.popupManager.showSettingPopup()
                // this.openPopUp()
                // setting Button
                // this.openSettingPopup();
            }, 1, true); // Adjusted the position index
            this.settingBtn.setPosition(gameConfig.scale.width * 0.15, gameConfig.scale.height * 0.65).setScale(0.8);
            this.add(this.settingBtn);
    }

    exitButton(){
            const exitButtonSprites = [
                this.scene.textures.get('exitButton'),
                this.scene.textures.get('exitButtonPressed')
            ];
            this.exitBtn = new InteractiveBtn(this.scene, exitButtonSprites, ()=>{
                    this.buttonMusic("buttonpressed")
                    this.popupManager.showLogoutPopup();
                    // this.openLogoutPopup();
            }, 0, true, );
            this.exitBtn.setPosition(gameConfig.scale.width * 0.76, gameConfig.scale.height * 0.11).setScale(1.2)
            this.add(this.exitBtn)
    }

    infoBtnInit() {
            const infoBtnSprites = [
                this.scene.textures.get('infoBtn'),
                this.scene.textures.get('infoBtnH'),
            ];
            this.infoBtn = new InteractiveBtn(this.scene, infoBtnSprites, () => {
                // info button 
                this.buttonMusic("buttonpressed")
                // this.openInfoPopup();
                this.popupManager.showInfoPopup();
            }, 2, true); // Adjusted the position index
            this.infoBtn.setPosition(gameConfig.scale.width * 0.15, gameConfig.scale.height * 0.75).setScale(0.8);
            this.add(this.infoBtn);
    }

    updateData(){
        const startValue = parseFloat(this.currentBalanceText.text);
        const endValue = ResultData.playerData.Balance;
        // Create the tween
        this.scene.tweens.add({
            targets: { value: startValue },
            value: endValue,
            duration: 1000, // Duration in milliseconds
            ease: 'Linear',
            onUpdate: (tween) => {
                // Update the text during the tween
                const currentValue = tween.getValue();
                this.currentBalanceText.updateLabelText(currentValue.toFixed(3).toString());
            },
            onComplete: () => {
                this.currentBalanceText.updateLabelText(endValue.toFixed(3).toString());
            }
        });

        //Animation for win Text
        const winStart = parseFloat(this.currentWiningText.text);
        const winendValue = ResultData.playerData.currentWining;
        // Create the tween
        this.scene.tweens.add({
            targets: { value: winStart },
            value: winendValue,
            duration: 500, // Duration in milliseconds
            ease: 'Linear',
            onUpdate: (tween) => {
                // Update the text during the tween
                const currentWinValue = tween.getValue();
                this.currentWiningText.updateLabelText(currentWinValue.toFixed(3).toString());
            },
            onComplete: () => {
                // Ensure final value is exact
                this.currentWiningText.updateLabelText(winendValue.toFixed(3).toString());
            }
        });
       
        if (ResultData.gameData.isBonus) {
            currentGameData.bonusOpen = true;
            this.scene.events.emit("bonusStateChanged", true);
            this.popupManager.showBonusPopup({
                onClose: () => {
                    currentGameData.bonusOpen = false;
                    this.scene.events.emit("bonusStateChanged", false);
                }
            });
        }
    }

    buttonMusic(key: string){
        this.SoundManager.playSound(key)
    }

    hideStopButton(){
        setTimeout(() => {
            this.stopButton.setVisible(false)
        }, 500);
    }
    update(dt: number){
        console.log("check container");
        
    }
}
