import * as Phaser from "Phaser";
import Play from "./Play";
import Boot from "./Boot";
import MyGame from "./MyGame";

function main()
{
    console.log(`Phaser Version: ${Phaser.VERSION}`);

    const config: Phaser.Types.Core.GameConfig = {
        title: "Cannon example taken from Phaser 3 with TypeScript, RequireJS library and AMD module system",
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                debug: true,
                gravity: { y: 300 },
                //debugShowBody: true
            }
        },    
        scene: [Boot, Play]  
    }
    
    const myGame = new MyGame(config);
}

// Run debug build (AMD module system, RequireJS)
main();

// Run release build (bundle.min.js, Browserify, UglifyJS)
// window.onload = () => main();