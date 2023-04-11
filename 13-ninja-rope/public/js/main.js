define(["require", "exports", "Phaser", "./Play", "./Boot", "./MyGame"], function (require, exports, Phaser, Play_1, Boot_1, MyGame_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function main() {
        console.log(`Phaser Version: ${Phaser.VERSION}`);
        const config = {
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
            scene: [Boot_1.default, Play_1.default]
        };
        const myGame = new MyGame_1.default(config);
    }
    // Run debug build (AMD module system, RequireJS)
    main();
});
// Run release build (bundle.min.js, Browserify, UglifyJS)
// window.onload = () => main();
//# sourceMappingURL=main.js.map