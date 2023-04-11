define(["require", "exports", "Phaser"], function (require, exports, Phaser) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Boot extends Phaser.Scene {
        constructor() {
            super("Boot");
        }
        preload() {
            console.log("Boot.preload()");
            this.load.image('backdrop', 'assets/platformer-backdrop.png');
            this.load.image('cannon_head', 'assets/cannon_head.png');
            this.load.image('cannon_body', 'assets/cannon_body.png');
            this.load.spritesheet('chick', 'assets/chick.png', { frameWidth: 16, frameHeight: 18 });
            this.load.atlasXML('metal', 'assets/spritesheet_metal.png', 'assets/spritesheet_metal.xml');
            this.load.atlasXML('pig', 'assets/round.png', 'assets/round.xml');
            //this.load.atlasXML('metal2', 'assets/spritesheet_metal.png', 'assets/spritesheet_metal.xml');
        }
        create() {
            console.log("Boot.create()");
            this.scene.start("Play");
        }
    }
    exports.default = Boot;
});
//# sourceMappingURL=Boot.js.map