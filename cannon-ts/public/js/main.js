define(["require", "exports", "Phaser", "./Play", "./Boot", "./MyGame"], function (require, exports, Phaser, Play_1, Boot_1, MyGame_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function main() {
        console.log(`Phaser Version: ${Phaser.VERSION}`);
        const config = {
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