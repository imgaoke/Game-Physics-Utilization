import * as Phaser from "Phaser";
import Play from "./Play";
import Boot from "./Boot";
import MyGame from "./MyGame";

function main()
{
    console.log(`Phaser Version: ${Phaser.VERSION}`);

    const config: Phaser.Types.Core.GameConfig = {
        title: "MatterJS improved upon http://phaser.io/examples/v3/view/games/firstgame/part10 with Ninja rope and TypeScript.",
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: 800,
        height: 600,
        physics: {
            default: 'matter',
            matter: {
                restingThresh: 2,
                debug: true,
                enableSleeping: false
            },
        },
        /*
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                //enableSleeping: true,
                debug: true
            }
        },
        */
        
        /*
        title: "Draw chain MatterJS example taken from Phaser 3 with TypeScript.",
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: 800,
        height: 600,
        physics: {
            default: 'matter', 
            matter: {
                gravity: {
                    y: 0.1
                },
                enableSleeping: true,
                debug: true
            }       
        },
        */  
        scene: [Boot, Play]  
    }
    
    const myGame = new MyGame(config);
}

// Run debug build (AMD module system, RequireJS)
main();

// Run release build (bundle.min.js, Browserify, UglifyJS)
// window.onload = () => main();