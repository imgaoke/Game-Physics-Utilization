import { Sleeping } from "matter";
import * as Phaser from "Phaser";


export default class Play extends Phaser.Scene {

    //platform : Phaser.Physics.Matter.Image;
    player: Phaser.Physics.Matter.Sprite;
    stars: MatterJS.CompositeType;
    cursors; // for up, down, left, right and space
    score = 0;
    gameOver = false;
    static hanging: boolean = false; // if the player is haning on the rope
    scoreText;
    static onFloor: boolean = false; // if the player is steping on the floor
    ropeWithTwoEnds; // rope to be generated
    arrayToBeDestroyed: Array<any> = []; // place to save the components of the rope so later we can remove the rope with the help of the array
    ropeNumber = 0;  // a number to help to keep rope number at maximum 1

    constructor() {
        super("Play");
    }

    create() {
        //  Increase the solver steps from the default to aid with the stack
        this.matter.world.engine.positionIterations = 80;
        this.matter.world.engine.velocityIterations = 80;

        //  A simple background for our game
        this.add.image(400, 300, 'sky');
        
        this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);

        // the group include the rope and the player such that they won't collide with each other
        var group = this.matter.world.nextGroup(true);
        // The player and its settings
        this.player = this.matter.add.sprite(100, 450, 'dude', null, {label: 'player', collisionFilter: { group: group }});
        this.matter.body.setInertia(this.player.body as MatterJS.BodyType, Infinity);
        this.player.setMass(0.1);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });        

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        //@ts-ignore        
        var ground1 = this.matter.add.image(400, 568, 'ground', null, {label: 'floor'}).setScale(2).setStatic(true);

        //  Now let's create some ledges
        //@ts-ignore
        var ledge1 = this.matter.add.image(600, 400, 'ground', null, {label: 'floor'}).setStatic(true);
        //@ts-ignore
        var ledge2 = this.matter.add.image(50, 250, 'ground', null, {label: 'floor'}).setStatic(true);
        //@ts-ignore
        var ledge3 = this.matter.add.image(750, 220, 'ground', null, {label: 'floor'}).setStatic(true);

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //  Some stars to collect, 11 in total, evenly spaced along the x axis
        this.stars = this.matter.add.imageStack('star', null, 0, 0, 11, 1, 53.5, 0, {label: 'star'}); //{ _mass: 0.5 } is omitted ... 53.5 = (800 - 24) / 10 - 24 - 0.1
        
        // set the restitution of stars
        var starsChildren = this.stars.bodies;
        for (var i = 0; i < starsChildren.length; i += 1) {
            starsChildren[i].restitution = Phaser.Math.FloatBetween(0.6, 0.8);
        }

        //@ts-ignore ... The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        
        // endBall of the rope
        var endBall: Phaser.Physics.Matter.Sprite;
        this.input.keyboard.on(
            'keydown-Z', 
            function(event){
                // make sure the rope number does not exceed 1
                if (this.ropeNumber == 1){
                    return;
                }

                if (this.cursors.left.isDown){
                    endBall = this.matter.add.image(this.player.x - 40, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                }
                else if (this.cursors.right.isDown){
                    endBall = this.matter.add.image(this.player.x + 40, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                }
                else{
                    endBall = this.matter.add.image(this.player.x, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                }
                this.arrayToBeDestroyed.push(endBall);
                (endBall.body as MatterJS.BodyType).label = "lastball";
                this.ropeWithTwoEnds = this.matter.add.constraint(this.player.body, endBall, 80, 1, {label: 'joint', render: {visible: true}});
                this.arrayToBeDestroyed.push(this.ropeWithTwoEnds); 
                
                this.ropeNumber += 1;
            }, 
            this
        );

        
        this.matter.world.on(
            'collisionstart',
            function(event){
                var pairs = event.pairs;
                for (var i = 0; i < pairs.length; i++)
                {
                    var bodyA = pairs[i].bodyA;
                    var bodyB = pairs[i].bodyB;
                    // convert the state of onFloor
                    if ((bodyA.label == 'player' && bodyB.label == 'floor' && bodyA.position.y <= bodyB.position.y - bodyB.centerOffset.y) ||
                    (bodyA.label == 'floor' && bodyB.label == 'player' && bodyB.position.y <= bodyA.position.y - bodyA.centerOffset.y))
                    {
                        Play.onFloor = true;
                    }
                    // if the player meet star, the star will be consumed and the score the increase by 10; if all stars disappear, new patch of stars and a bomb will drop
                    else if ((bodyA.label == 'player' && bodyB.label == 'star') || (bodyA.label == 'star' && bodyB.label == 'player'))
                    {
                        var bodyOfStar;
                        if (bodyB.label == 'star'){
                            bodyOfStar = bodyB;
                        }
                        else{
                            bodyOfStar = bodyA;
                        }
                        bodyOfStar.gameObject.destroy();

                        //  Add and update the score
                        this.score += 10;
                        this.scoreText.setText('Score: ' + this.score);
                        
                        if (this.stars.bodies.length == 0){
                            this.stars = this.matter.add.imageStack('star', null, 0, 0, 11, 1, 53.5, 0, {label: 'star'});
                            var bomb : Phaser.Physics.Matter.Image = this.matter.add.image(Phaser.Math.Between(32, 768), 20, 'bomb', Phaser.Math.Between(0, 5), {label: 'redball'});
                            bomb.setBounce(0.99);
                            bomb.setFriction(0); 
                            bomb.setFrictionAir(0.01);
                            this.matter.body.setInertia(bomb.body as MatterJS.BodyType, Infinity);
                            bomb.setVelocity(Phaser.Math.Between(-5, 5), 0);
                        }   
                    }
                    // if the player touch the bomb, game over
                    else if ((bodyA.label == 'player' && bodyB.label == 'redball') || (bodyA.label == 'redball' && bodyB.label == 'player'))
                    {
                        this.hitBomb(this.player);
                        
                    }
                    // if the end point touches the floor above, the rope will be hinged to the floor above
                    else if ((bodyA.label == 'lastball' && bodyB.label == 'floor' && bodyB.position.y < this.player.y) ||
                    (bodyA.label == 'floor' && bodyB.label == 'lastball' && bodyA.position.y < this.player.y) && Play.hanging == false) 
                    {
                        var constraintBetweenWorldPointAndLastBall = 
                        this.matter.add.worldConstraint(endBall, 10, 1, {
                            pointA: { x: endBall.x, y: endBall.y }, 
                            pointB: { x: 0, y: 0 }
                        });
                        this.arrayToBeDestroyed.push(constraintBetweenWorldPointAndLastBall);
                        Play.hanging = true;
                    }
                    // if the end point touches the floor below, the rope will be removed
                    else if (((bodyA.label == 'floor' && bodyB.label == 'lastball') || (bodyA.label == 'lastball' && bodyB.label == 'floor')) && Play.hanging == false)
                    {
                        // remove the constraints between the rope end points
                        for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                            if (this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint' ){
                                this.matter.world.removeConstraint(this.arrayToBeDestroyed[i])
                            }
                        }
                        // remove the end bodies which were connected by the constraints
                        for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                            if (!(this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint') && this.arrayToBeDestroyed[i].body){
                                this.arrayToBeDestroyed[i].body.gameObject.destroy();
                                this.arrayToBeDestroyed[i].destroy();
                            }
                        }
                        this.arrayToBeDestroyed = [];
                        this.ropeNumber -= 1;
                    }
                }
            },
            this
        );
        
        // change the state of onFloor
        this.matter.world.on(
            'collisionend',
            function(event){
                var pairs = event.pairs;
                for (var i = 0; i < pairs.length; i++)
                {
                    var bodyA = pairs[i].bodyA;
                    var bodyB = pairs[i].bodyB;
                    if ((bodyA.label == 'player' && bodyB.label == 'floor') || (bodyA.label == 'floor' && bodyB.label == 'player')){
                        Play.onFloor = false;
                    }
                }
            }
        );       
    }
    
    hitBomb (player, bomb){

        this.matter.pause()

        player.setTint(0xff0000);

        player.anims.play('turn');

        const gameOver = true;
    }

    update ()
    {
        if (this.gameOver)
        {
            console.log(this.gameOver);
            return;
        }

        // if the player is not haning on the rope, the player and move left or right
        if (this.cursors.left.isDown && Play.hanging == false)
        {
            this.player.setVelocityX(-5);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown && Play.hanging == false)
        {
            this.player.setVelocityX(5);

            this.player.anims.play('right', true);
        }
        
        else if (Play.hanging == false)
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }
        
        // if the player is haning on the rope, the player swing left or right
        if (this.cursors.left.isDown && Play.hanging == true)
        {
            this.player.applyForce(new Phaser.Math.Vector2(-0.0001,0));

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown && Play.hanging == true)
        {
            this.player.applyForce(new Phaser.Math.Vector2(0.0001,0));

            this.player.anims.play('right', true);
        }


        // if the player is not haning on the rope and on the floor, the player can jump
        if (this.cursors.up.isDown && Play.hanging == false && Play.onFloor == true)
        {
            this.player.setVelocityY(-9);
        }

        // if the player is haning on the rope, the rope can shrink or extend
        if (this.cursors.up.isDown && Play.hanging == true)
        {
            if (this.ropeWithTwoEnds.length > 40){
                this.ropeWithTwoEnds.length -= 1;
            }
            
        }
        else if (this.cursors.down.isDown && Play.hanging == true)
        {
            if (this.ropeWithTwoEnds.length < 80){
                this.ropeWithTwoEnds.length += 1;
            }
            
        }

        // if the player is haning on the rope and press space, the rope will be removed
        if (this.cursors.space.isDown && Play.hanging == true)
        {
            if (Play.hanging == true){
                this.matter.world.remove(this.arrayToBeDestroyed);
                Play.hanging = false;
                for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                    if (!(this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint') && this.arrayToBeDestroyed[i].body){
                        this.arrayToBeDestroyed[i].body.gameObject.destroy();
                        this.arrayToBeDestroyed[i].destroy();
                    }
                }
                this.ropeNumber -= 1;
            }
        }
    }
}
