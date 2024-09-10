import Phaser from 'phaser';
import { Globals, ResultData, initData } from "./Globals";
import { gameConfig } from './appconfig';
import { UiContainer } from './UiContainer';
import { Easing, Tween } from "@tweenjs/tween.js"; // If using TWEEN for animations
import SoundManager from './SoundManager';
export class Slots extends Phaser.GameObjects.Container {
    slotMask: Phaser.GameObjects.Graphics;
    SoundManager: SoundManager
    slotSymbols: any[][] = [];
    moveSlots: boolean = false;
    uiContainer!: UiContainer;
    // winingMusic!: Phaser.Sound.BaseSound
    resultCallBack: () => void;
    slotFrame!: Phaser.GameObjects.Sprite;
    private maskWidth: number;
    private maskHeight: number;
    private symbolKeys: string[];
    private symbolWidth: number;
    private symbolHeight: number;
    private spacingX: number;
    private spacingY: number;
    private reelContainers: Phaser.GameObjects.Container[] = [];
    constructor(scene: Phaser.Scene, uiContainer: UiContainer, callback: () => void, SoundManager : SoundManager) {
        super(scene);

        this.resultCallBack = callback;
        this.uiContainer = uiContainer;
        this.SoundManager = SoundManager
        this.slotMask = new Phaser.GameObjects.Graphics(scene);
        
        this.maskWidth = gameConfig.scale.width / 1.8;
        this.maskHeight = 570;
        this.slotMask.fillStyle(0xffffff, 1);
        this.slotMask.fillRoundedRect(0, 0, this.maskWidth, this.maskHeight, 20);
        // mask Position set
        this.slotMask.setPosition(
            gameConfig.scale.width / 4,
            gameConfig.scale.height /4.1 
        );
        // this.add(this.slotMask);
        // Filter and pick symbol keys based on the criteria
        this.symbolKeys = this.getFilteredSymbolKeys();
        
        // Assume all symbols have the same width and height
        const exampleSymbol = new Phaser.GameObjects.Sprite(scene, 0, 0, this.getRandomSymbolKey());
        this.symbolWidth = exampleSymbol.displayWidth/ 4;
        this.symbolHeight = exampleSymbol.displayHeight/4;
        this.spacingX = this.symbolWidth * 3.1; // Add some spacing
        this.spacingY = this.symbolHeight * 4; // Add some spacing
        const startPos = {
            x: gameConfig.scale.width / 3,
            y: gameConfig.scale.height /3.25     
        };
        const totalSymbol = 14;
        const visibleSymbol = 3;
        const startIndex = 1;
        const initialYOffset = (totalSymbol - startIndex - visibleSymbol) * this.spacingY;
        for (let i = 0; i < 5; i++) { // 5 columns
            const reelContainer = new Phaser.GameObjects.Container(scene);
            this.reelContainers.push(reelContainer); // Store the container for future use
            
            this.slotSymbols[i] = [];
            for (let j = 0; j < 14; j++) { // 3 rows
                let symbolKey = this.getRandomSymbolKey(); // Get a random symbol key
                let slot = new Symbols(scene, symbolKey, { x: i, y: j }, reelContainer);
                slot.symbol.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.slotMask));
                slot.symbol.setPosition(
                    startPos.x + i * this.spacingX,
                    startPos.y + j * this.spacingY
                );
                slot.symbol.setScale(0.8, 0.8)
                slot.startX = slot.symbol.x;
                slot.startY = slot.symbol.y;
                this.slotSymbols[i].push(slot);                
                reelContainer.add(slot.symbol)
            }
            reelContainer.setPosition(reelContainer.x, -initialYOffset);
            this.add(reelContainer); 
        }
    }

    getFilteredSymbolKeys(): string[] {
        // Filter symbols based on the pattern
        const allSprites = Globals.resources;
        const filteredSprites = Object.keys(allSprites).filter(spriteName => {
            const regex = /^slots\d+_\d+$/; // Regex to match "slots<number>_<number>"
            if (regex.test(spriteName)) {
                const [, num1, num2] = spriteName.match(/^slots(\d+)_(\d+)$/) || [];
                const number1 = parseInt(num1, 10);
                const number2 = parseInt(num2, 10);
                // Check if the numbers are within the desired range
                return number1 >= 1 && number1 <= 14 && number2 >= 1 && number2 <= 14;
            }
            return false;
        });

        return filteredSprites;
    }

    getRandomSymbolKey(): string {
        const randomIndex = Phaser.Math.Between(0, this.symbolKeys.length - 1);        
        return this.symbolKeys[randomIndex];
    }

    moveReel() {      
        // Move the reel container back to its start position
       
        for (let i = 0; i < this.reelContainers.length; i++) {
            for (let j = 0; j < this.reelContainers[i].list.length; j++) {
                // setTimeout(() => {
                    this.slotSymbols[i][j].startMoving = true;
                    // if (j < 3) this.slotSymbols[i][j].stopAnimation();
                // }, 100 * i);
            }
        }
        this.uiContainer.maxbetBtn.disableInteractive();
        this.moveSlots = true;
    }

    update(time: number, delta: number) {
        if (this.slotSymbols && this.moveSlots) {
            for (let i = 0; i < this.reelContainers.length; i++) {
                // Update the position of the entire reel container (move the reel upwards)
                for (let j = 0; j < this.slotSymbols[i].length; j++) {
                    // Update each symbol in the reel
                    this.slotSymbols[i][j].update(delta);
                }
            }
        }
    }
    
    stopTween() {
        // Calculate the maximum delay for stopping the reels
        const maxDelay = 200 * (this.reelContainers.length - 1);
    
        // Call resultCallBack after all tweens finish
        setTimeout(() => {
            this.resultCallBack();
            this.moveSlots = false;
    
            ResultData.gameData.symbolsToEmit.forEach((rowArray: any) => {
                rowArray.forEach((row: any) => {
                    if (typeof row === "string") {
                        const [y, x]: number[] = row.split(",").map((value) => parseInt(value));
                        const animationId = `symbol_anim_${ResultData.gameData.ResultReel[x][y]}`;
                        if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
                            this.winMusic("winMusic");
                            this.slotSymbols[y][x].playAnimation(animationId);
                        }
                    }
                });
            });
        }, maxDelay + 100); // Ensure resultCallBack is called after all reels stop
    
        // Iterate over reelContainers and stop them with a delay
        for (let i = 0; i < this.reelContainers.length; i++) {
            setTimeout(() => {
                this.stopReel(this.reelContainers[i], i);
            }, 100 * i); // Delay each reel stop by 200ms times its index
        }
    }
    
    stopReel(reelContainer: Phaser.GameObjects.Container, reelIndex: number) {
        // Stop the motion of the reelContainer
        this.scene.tweens.add({
            targets: reelContainer,
            // y: 19 * 204, // Move to final stopping position
            duration: 100, // Duration for stopping animation
            ease: 'Bounce.easeOut', // Easing for a smooth stop
            onComplete: () => {
               for (let i = 0; i < this.slotSymbols.length; i++) {
                    for (let j = 0; j < this.slotSymbols[i].length; j++) {
                      setTimeout(() => {
                            this.slotSymbols[i][j].endTween();
                        }, 100 * i);
                    }
                }
            }
        });
    }
    // winMusic
    winMusic(key: string){
        this.SoundManager.playSound(key)
    }
    
}

// @Sybols CLass
class Symbols {
    symbol: Phaser.GameObjects.Sprite;
    startY: number = 570;
    startX: number = 0;
    startMoving: boolean = false;
    index: { x: number; y: number };
    totalSymbol : number = 14;
    visibleSymbol: number = 3;
    startIndex: number = 1;
    spacingY : number = 204;
    initialYOffset : number = 0
    scene: Phaser.Scene;
    private isMobile: boolean;
    reelContainer: Phaser.GameObjects.Container;
    tween?: Phaser.Tweens.Tween; // Optional tween reference

    constructor(scene: Phaser.Scene, symbolKey: string, index: { x: number; y: number }, reelContainer: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.index = index;
        this.reelContainer = reelContainer;
        const updatedSymbolKey = this.updateKeyToZero(symbolKey);
        this.symbol = new Phaser.GameObjects.Sprite(scene, 0, 0, updatedSymbolKey);
        this.symbol.setOrigin(0.5, 0.5);
        this.isMobile = scene.sys.game.device.os.android || scene.sys.game.device.os.iOS;

        const textures: string[] = [];
        for (let i = 0; i < 14; i++) {
            textures.push(`${symbolKey}`);
        }

        this.scene.anims.create({
            key: `${symbolKey}`,
            frames: textures.map((texture) => ({ key: texture })),
            frameRate: 20,
            repeat: -1,
        });
    }

    updateKeyToZero(symbolKey: string): string {
        const match = symbolKey.match(/^slots(\d+)_\d+$/);
        if (match) {
            const xValue = match[1];
            return `slots${xValue}_0`;
        } else {
            return symbolKey; // Return the original key if format is incorrect
        }
    }

    playAnimation(animationId: any) {
        this.symbol.play(animationId);
    }

    stopAnimation() {
        this.symbol.anims.stop();
        this.symbol.setFrame(0);
    }

    endTween() {
        // Move the reel container back to its start position
        this.initialYOffset = (this.totalSymbol - this.visibleSymbol - this.startIndex) * this.spacingY
        this.reelContainer.setPosition(
            this.reelContainer.x,
            - this.initialYOffset// Set position back to the calculated start position
        );
        if(this.index.y < 3){
            // Check if ResultData and ResultData.gameData are defined
            
                // Retrieve the elementId based on index
            const elementId = ResultData.gameData.ResultReel[this.index.y][this.index.x];
            console.log(this.reelContainer.list, "this.reelContainer.list");
            for (let reelIndex = 10; reelIndex <= 12; reelIndex++) {
                const symbolSprite = this.reelContainer.list[reelIndex] as Phaser.GameObjects.Sprite; // Type assertion
                // Retrieve symbolId, providing a fallback if it doesn't exist
                const symbolData = symbolSprite.data;

                if (!symbolData) {
                    console.error(`symbolSprite.data is null at index ${reelIndex}`);
                    continue;
                }
            
                const symbolId = symbolData.get('symbolId');
                if (!symbolId) {
                    console.error(`symbolId is missing or null for symbolSprite at index ${reelIndex}`);
                    continue;
                }

                
                if (!symbolId) {
                    console.error(`symbolId is missing or null for symbolSprite at index ${reelIndex}`);
                    continue; // Skip this sprite if symbolId is not available
                }
                let textureKeys: string[] = []; // Array to hold valid texture keys
            
                // Loop through 14 possible texture variations for this symbol (0 to 13)
                for (let i = 0; i < 14; i++) {
                    const textureKey = `slots${symbolId}_${i}`; // Construct texture key
            
                    // Check if the texture exists in cache
                    if (this.scene.textures.exists(textureKey)) {
                        textureKeys.push(textureKey); // Push the texture key into the array
                    }
                }
            
                // If we have valid texture keys, replace the current texture
                if (textureKeys.length > 0) {
                    // Replace the current texture with the new one (randomly or the first one)
                    const newTextureKey = textureKeys[Math.floor(Math.random() * textureKeys.length)]; // Randomly select a texture from the array
                    (symbolSprite as Phaser.GameObjects.Sprite).setTexture(newTextureKey); // Set the new texture on the sprite
            
                    // Optionally, you could also store the new texture for reference
                    symbolSprite.data.set('currentTexture', newTextureKey); // Store the texture key for future reference
                } else {
                    console.warn(`No valid textures found for symbol at index ${reelIndex}`);
                }
            }
        }
            
        // Set `startMoving` to false to stop movement
        this.startMoving = false;
        // Add a tween animation for the reel container, adjusting its position smoothly
        this.scene.tweens.add({
            targets: this.reelContainer,
            y: this.reelContainer,
            duration: 300,
            ease: 'Bounce.easeOut',
            repeat: 0,
            onComplete: () => {
                // Additional logic after the tween completes if necessary
            },
        });
    }
    
    update(dt: number) {
        if (this.startMoving) {
            const deltaY = 0.1 * dt;
            const newY = this.reelContainer.y + (deltaY * 1.2);
            this.reelContainer.y = newY;
            if (newY >= (this.isMobile ? window.innerHeight * 2 : (window.innerHeight * 4.5))) {
                this.reelContainer.y = 0;
            }
        }
    }
    
}
