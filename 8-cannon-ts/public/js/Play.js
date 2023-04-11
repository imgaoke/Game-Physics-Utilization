define(["require", "exports", "Phaser"], function (require, exports, Phaser) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Play extends Phaser.Scene {
        constructor() {
            super("Play");
            this.currentScore = 0;
            this.chickNumber = 1;
            this.gameOver = false;
        }
        create() {
            console.log("Play.create()");
            this.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('chick', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
            this.add.image(320, 256, 'backdrop').setScale(3);
            this.cannonHead = this.add.image(130, 416, 'cannon_head').setDepth(1);
            this.cannon = this.add.image(130, 464, 'cannon_body').setDepth(1);
            this.chick = this.physics.add.sprite(this.cannon.x, this.cannon.y - 50, 'chick').setScale(2);
            this.gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 10, color: 0xffdd00, alpha: 0.5 } });
            this.line = new Phaser.Geom.Line();
            this.angle = 0;
            this.input.on('pointermove', function (pointer) {
                this.angle = Phaser.Math.Angle.BetweenPoints(this.cannon, pointer);
                this.cannonHead.rotation = this.angle;
                Phaser.Geom.Line.SetToAngle(this.line, this.cannon.x, this.cannon.y - 50, this.angle, 128);
                this.gfx.clear().strokeLineShape(this.line);
            }, this);
            this.input.on('pointerup', function () {
                if (this.chickNumber > 0 && (this.chick.x > 800 || this.chick.x == this.cannon.x)) {
                    this.chick.enableBody(true, this.cannon.x, this.cannon.y - 50, true, true);
                    this.chick.play('fly');
                    this.physics.velocityFromRotation(this.angle, 1200, this.chick.body.velocity);
                    this.chickNumber -= 1;
                }
            }, this);
            var group1 = this.physics.add.group({
                collideWorldBounds: true,
                dragX: 20,
                customBoundsRectangle: new Phaser.Geom.Rectangle(0, 0, 1500, 600)
            });
            group1.createMultiple({ key: 'metal', repeat: 1, frame: 'elementMetal002.png', setXY: { x: 570, y: 565, stepX: 71 } }); // layer 0
            group1.createMultiple({ key: 'metal', repeat: 2, frame: 'elementMetal001.png', setXY: { x: 545, y: 495, stepX: 71 } }); // layer 1        
            group1.createMultiple({ key: 'metal', repeat: 1, frame: 'elementMetal000.png', setXY: { x: 535, y: 425, stepX: 141 } }); // layer 2
            var group2 = this.physics.add.group({
                collideWorldBounds: true,
                customBoundsRectangle: new Phaser.Geom.Rectangle(0, 0, 1500, 600)
            });
            this.metal = this.physics.add.sprite(605, 280, 'metal', 'elementMetal020.png');
            group1.add(this.metal);
            this.pig = this.physics.add.sprite(605, 100, 'pig', 'pig.png').setScale(0.5);
            this.physics.add.collider(group1, this.pig);
            this.pig.setCollideWorldBounds(true);
            //this.chick.setDamping(true);
            //this.chick.setDrag(0.8);
            group2.add(this.chick);
            this.physics.add.collider(group1, undefined);
            this.chick.disableBody(true, true);
            //@ts-ignore
            this.text1 = this.add.text(10, 10, 'Current Score:' + this.currentScore, { font: '16px Courier', fill: '#00ff00' });
            //@ts-ignore
            this.text2 = this.add.text(10, 30, 'Current Chick Number:' + this.chickNumber, { font: '16px Courier', fill: '#00ff00' });
            //@ts-ignore
            this.text3 = this.add.text(10, 60, 'Winning Condition: make the pig touch the ground', { font: '16px Courier', fill: '#00ff00' });
            this.physics.add.collider(group1, group2, 
            //@ts-ignore
            function (memberOfGroup1, memberOfGroup2) {
                this.currentScore += 10;
                memberOfGroup1.destroy();
            }, undefined, this);
            this.dbody().onWorldBounds = true;
            this.physics.world.on('worldbounds', this.onWorldBounds, this);
        }
        onWorldBounds() {
            this.text1.setText('VICTORY');
            this.text2.setText('');
            this.text3.setText('');
            this.gameOver = true;
            return;
        }
        dbody() {
            return this.pig.body;
        }
        update(time, delta) {
            if (this.gameOver == true) {
                return;
            }
            this.text1.setText('Current Score:' + this.currentScore);
            this.text2.setText('Current Chick Number:' + this.chickNumber);
        }
    }
    exports.default = Play;
});
//# sourceMappingURL=Play.js.map