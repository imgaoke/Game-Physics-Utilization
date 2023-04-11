define(["require", "exports", "Phaser"], function (require, exports, Phaser) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Boot extends Phaser.Scene {
        constructor() {
            super("Boot");
        }
        preload() {
            console.log("Boot.preload()");
            this.load.image('sky', 'assets/sky.png');
            this.load.image('ground', 'assets/platform.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
            this.load.image('ball', 'assets/shinyball.png');
        }
        create() {
            console.log("Boot.create()");
            this.scene.start("Play");
        }
    }
    exports.default = Boot;
});
//# sourceMappingURL=Boot.js.map