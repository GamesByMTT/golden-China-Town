import Phaser, { Scene, GameObjects } from "phaser";
import { Globals, initData, } from "../Globals";
import { gameConfig } from "../appconfig";

export default class InfoPopup extends GameObjects.Container {
    constructor(scene: Scene) {
        super(scene)

        const popupBackground = this.scene.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height / 2, "InfoPopupBg");
        popupBackground.setDisplaySize(1920, 1080);
        this.add(popupBackground);
        const winningLine = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.1, "Winning are calculated based on bet per line \nBet Per Line = Total Bet / Number of Lines", {fontFamily:"Serat", fontSize: 30, color: "#000000"}).setOrigin(0.5);
        // 3. Add a heading image to the popup container 
        const headingImage = this.scene.add.image(gameConfig.scale.width / 2, gameConfig.scale.height / 2 - 350, 'headingImage'); 
        this.add([headingImage, winningLine]);
        // 4. Add a close button to the popup 
        const closeButton = this.scene.add.sprite(gameConfig.scale.width / 2 + 800, gameConfig.scale.height / 2 - 400, 'exitButton').setInteractive();
        closeButton.setScale(0.5); closeButton.on('pointerdown', () => {
            this.scene.events.emit("closePopup")
            // Destroy the scroll container when the popup is closed
        });
        this.add(closeButton);
        // 5. Create a mask to define the visible area for scrolling 
        const maskShape = this.scene.make.graphics().fillRect(
            0, // Adjust X position to center 
            gameConfig.scale.height / 2 - 300, // Adjust Y position 
            gameConfig.scale.width - 100, // Full width minus some padding 
            800 // Desired height of the scrollable area 
        );
        const mask = maskShape.createGeometryMask();
        // 6. Add the scrollable container to the popup container 
        const scrollContainer = this.scene.add.container(
            0, // Adjust X position to align with the mask
            gameConfig.scale.height / 2 - 300 // Adjust Y position
        );
        scrollContainer.setMask(mask); // Apply the mask to the scroll container 
        this.add(scrollContainer);
        // console.log("initData", initData.UIData.symbols);

        // 7. Add the content that will be scrolled 
        const contentHeight = 3100; // Example content height, adjust as needed 
        // const content = this.scene.add.image( gameConfig.scale.width / 2, 100, 'minorSymbolsHeading' ).setOrigin(0.5).setDepth(2); 
        const content = this.scene.add.text(gameConfig.scale.width / 2, 100, "Minor Symbol", { fontSize: '70px', color: '#920000', align: "Center", stroke: "#920000", strokeThickness: 3, fontFamily:"Serat" }).setOrigin(0.5)
        const minSymbol1 = this.scene.add.image(350, 350, "slots0_0").setDepth(2).setScale(0.8)
        const minSymbol2 = this.scene.add.image(850, 350, "slots1_0").setDepth(2).setScale(0.8)
        const minSymbol3 = this.scene.add.image(1350, 350, "slots2_0").setDepth(2).setScale(0.8)
        const minSymbol4 = this.scene.add.image(650, 550, "slots3_0").setDepth(2).setScale(0.8)
        const minSymbol5 = this.scene.add.image(1050, 550, "slots4_0").setDepth(2).setScale(0.8)


        const infoIcons = [
            { x: 470, y: 300 }, // Position for infoIcon2
            { x: 940, y: 300 }, // Position for infoIcon3
            { x: 1450, y: 300 }, //
            { x: 770, y: 500 }, //
            { x: 1170, y: 500 }, //
        ]
        const minorIcon = initData.UIData.symbols
        minorIcon.forEach((symbol, symbolIndex) => {
            // Get the corresponding infoIcon position
            const iconPosition = infoIcons[symbolIndex];
            if (!iconPosition) return; // Avoid undefined positions
            // Loop through each multiplier array (e.g., [100, 0], [50, 0])
            symbol.multiplier.slice(0, 4).forEach((multiplierValueArray, multiplierIndex) => {
                // Ensure multiplierValueArray is an array before accessing elements
                if (Array.isArray(multiplierValueArray)) {
                    const multiplierValue = multiplierValueArray[0]; // Access the first value of the array
                    if (multiplierValue > 0) {  // Only print if the value is greater than 0
                        // Determine the text (e.g., '5x', '4x', '2x')
                        const prefix = [5, 4, 2][multiplierIndex] || 1; // Customize this if needed
                        // Create the text content
                        const text = `${prefix}x ${multiplierValue}`;
                        // Create the text object
                        const textObject = this.scene.add.text(
                            iconPosition.x, // X position
                            iconPosition.y + multiplierIndex * 40, // Y position (spacing between lines)
                            text,
                            { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" } // Customize text style
                        );
                        // Set line spacing and other styles
                        textObject.setLineSpacing(10);  // Adjust the line height as needed
                        textObject.setOrigin(0, 0.5); // Center the text if needed
                        scrollContainer.add(textObject);
                    }
                }
            });
        });

        //Major Symbol
        const MajorSymBolHeading = this.scene.add.text(gameConfig.scale.width / 2, 800, "Major Symbol", { fontSize: '50px', color: '#920000', align: "Center", stroke: "#920000", strokeThickness: 3, fontFamily:"Serat" }).setOrigin(0.5)
        const majorSymbol1 = this.scene.add.image(350, 1100, "slots5_0").setDepth(2).setScale(0.8)
        const majorSymbol2 = this.scene.add.image(850, 1100, "slots6_0").setDepth(2).setScale(0.8)
        const majorSymbol3 = this.scene.add.image(1350, 1100, "slots7_0").setDepth(2).setScale(0.8)
        const majorSymbol4 = this.scene.add.image(650, 1300, "slots8_0").setDepth(2).setScale(0.8)
        const majorSymbol5 = this.scene.add.image(1050, 1300, "slots9_0").setDepth(2).setScale(0.8)
        const majorSymbol1Text = this.scene.add.text(470, 1050, '5X - 200 \n4X - 100 \n3X - 60', { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" })
        const majorSymbol2Text = this.scene.add.text(950, 1050, '5X - 200 \n4X - 100 \n3X - 60', { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" })
        const majorSymbol3Text = this.scene.add.text(1450, 1050, '5X - 200 \n4X - 100 \n3X - 60', { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" })
        const majorSymbol4Text = this.scene.add.text(770, 1250, '5X - 200 \n4X - 100 \n3X - 60', { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" })
        const majorSymbol5Text = this.scene.add.text(1170, 1250, '5X - 200 \n4X - 100 \n3X - 60', { fontSize: '30px', color: '#920000', align: "left", fontFamily:"Serat" })
        const specialSymBol1 = this.scene.add.image(200, 1750, "slots10_0").setDepth(2).setOrigin(0.5).setScale(0.8)
        const specialSymBol2 = this.scene.add.image(200, 1950, "slots11_0").setDepth(2).setOrigin(0.5).setScale(0.8)
        const specialSymBol3 = this.scene.add.image(200, 2150, "slots12_0").setDepth(2).setOrigin(0.5).setScale(0.8)
        const specialSymBol4 = this.scene.add.image(200, 2350, "slots13_0").setDepth(2).setOrigin(0.5).setScale(0.8)
        const specialSymBol5 = this.scene.add.image(200, 2550, "slots14_0").setDepth(2).setOrigin(0.5).setScale(0.8)

        //Special Symbol
        const specialSymBolHeading = this.scene.add.text(gameConfig.scale.width / 2, 1550, "Special Symbol", { fontSize: '50px', color: '#920000', align: "Center", stroke: "#920000", strokeThickness: 3,  fontFamily: "Serat"}).setOrigin(0.5)
        const descriptionPos = [
            { x: 350, y: 1700 },
            { x: 350, y: 1900 },
            { x: 350, y: 2100 },
            { x: 350, y: 2300 },
            { x: 350, y: 2500 },
        ]
        for (let i = 10; i <= 14; i++) {
            const symbol = initData.UIData.symbols[i];
            if (symbol) {
                const position = descriptionPos[i - 10];
                const descriptionText = `${symbol.description}`;
                // Create the text object
                const descriptionObject = this.scene.add.text(
                    position.x, // X position
                    position.y + 40, // Y position (spacing between lines)
                    descriptionText,
                    { fontSize: '30px', color: '#920000', align: "left", fontFamily: "Serat", wordWrap: { width: 1200, useAdvancedWrap: true } } // Customize text style
                );
                descriptionObject.setLineSpacing(10);  // Adjust the line height as needed
                descriptionObject.setOrigin(0, 0.5); // Center the text if needed
                scrollContainer.add(descriptionObject)
            } else {
            }
        }

        const payLineHeading = this.scene.add.text(gameConfig.scale.width / 2, 2700, "PayLines", { fontSize: '70px', color: '#920000', align: "Center", stroke: "#920000", strokeThickness: 3, fontFamily:"Serat" }).setOrigin(0.5)
        const payLines = this.scene.add.image(gameConfig.scale.width / 2, 3000, 'payLinesImage').setScale(0.9);
        // const MajorSymBolHeading = this.scene.add.image( gameConfig.scale.width / 2, 800, 'majorSymbolHeading' ).setOrigin(0.5).setDepth(2);

        scrollContainer.add([content, minSymbol1, minSymbol2,
            minSymbol3, minSymbol4, minSymbol5,
            MajorSymBolHeading, majorSymbol1, majorSymbol1Text, majorSymbol2, majorSymbol2Text,
            majorSymbol3, majorSymbol3Text, majorSymbol4, majorSymbol5, majorSymbol4Text, majorSymbol5Text, specialSymBolHeading, specialSymBol1, specialSymBol2, specialSymBol3, specialSymBol4, specialSymBol5, payLineHeading, payLines
        ]);
        // 8. Scrollbar background 
        const scrollbarBg = this.scene.add.sprite(gameConfig.scale.width - 40, // Positioned on the right side 
            gameConfig.scale.height / 2, 'scrollBg').setOrigin(0.5).setDisplaySize(50, 600); // Adjust height as needed 
        this.add(scrollbarBg);
        // 9. Roller image for the scrollbar 
        const roller = this.scene.add.image(gameConfig.scale.width - 40, gameConfig.scale.height / 2 - 200, 'scroller').setOrigin(0.5).setInteractive({ draggable: true });
        this.add(roller);
        // 10. Add drag event listener to the roller 
        this.scene.input.setDraggable(roller);
        roller.on('drag', (pointer: any, dragX: number, dragY: number) => {
            // Keep the roller within the scrollbar bounds
            const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
            const maxY = scrollbarBg.getBottomCenter().y - roller.height / 2;

            // Clamp roller position
            dragY = Phaser.Math.Clamp(dragY, minY, maxY);
            roller.y = dragY;

            // Calculate the scroll percentage (0 to 1)
            const scrollPercent = (dragY - minY) / (maxY - minY);

            // Map the scroll percentage to the content's Y position range
            const contentMaxY = 300; // The top position of content (relative to mask)
            const contentMinY = -(contentHeight - 600); // The bottom position of content relative to mask

            // Update scroll container's Y position based on scroll percentage
            scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
        });

        this.scene.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
            const maxY = scrollbarBg.getBottomCenter().y - roller.height / 2;

            // Adjust roller Y position based on mouse wheel movement
            let newY = roller.y + deltaY * 0.1; // Adjust speed of scroll
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            roller.y = newY;
            // Calculate the scroll percentage (0 to 1)
            const scrollPercent = (newY - minY) / (maxY - minY);
            // Map the scroll percentage to the content's Y position range
            const contentMaxY = 300; // The top position of content (relative to mask)
            const contentMinY = -(contentHeight - 600); // The bottom position of content relative to mask
            // Update scroll container's Y position based on scroll percentage
            scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
        });
    }
}