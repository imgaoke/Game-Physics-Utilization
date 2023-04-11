import { Sleeping } from "matter";
import * as Phaser from "Phaser";


export default class Play extends Phaser.Scene {

    //platform : Phaser.Physics.Matter.Image;
    player: Phaser.Physics.Matter.Sprite;
    stars: MatterJS.CompositeType;
    bombs;
    platforms;
    cursors;
    score = 0;
    gameOver = false;
    static hanging: boolean = false;
    scoreText;
    static onFloor: boolean = false; // ++why this has to be set to static
    ropeWithTwoEnds;
    arrayToBeDestroyed: Array<any> = [];
    ropeNumber = 0;

    constructor() {
        super("Play");
    }

    create() {
        //  Increase the solver steps from the default to aid with the stack
        this.matter.world.engine.positionIterations = 80;
        this.matter.world.engine.velocityIterations = 80;
        //  A simple background for our game
        this.add.image(400, 300, 'sky');
        
        // ++ is there any way to add categories of the bound so 'dude' cannot pass the bound above while the stars can
        this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);

        // The player and its settings
        //this.player = this.physics.add.sprite(100, 450, 'dude');
        var group = this.matter.world.nextGroup(true);
        this.player = this.matter.add.sprite(100, 450, 'dude', null, {label: 'player', collisionFilter: { group: group }});
        this.matter.body.setInertia(this.player.body as MatterJS.BodyType, Infinity);
        // ++ReferenceError: MatterJS is not defined
        //MatterJS.Sleeping.set(this.player.body as MatterJS.BodyType, false);

        

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.2);
        //this.player.setCollideWorldBounds(true);

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

        //  The platforms group contains the ground and the 2 ledges we can jump on
        //this.platforms = this.physics.add.staticGroup();
        var group1 = this.matter.world.nextGroup();
        

        var cat1 = this.matter.world.nextCategory();
        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        //this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        //@ts-ignore
        //var ground1 = this.matter.add.image(400, 568, 'ground').setScale(2).setStatic(true).setCollisionGroup(group1);
        
        var ground1 = this.matter.add.image(400, 568, 'ground', null, {label: 'floor'}).setScale(2).setStatic(true).setCollisionCategory(cat1);

        //  Now let's create some ledges
        //this.platforms.create(600, 400, 'ground');
        //this.platforms.create(50, 250, 'ground');
        //this.platforms.create(750, 220, 'ground');
        //@ts-ignore
        var ledge1 = this.matter.add.image(600, 400, 'ground', null, {label: 'floor'}).setStatic(true);
        //@ts-ignore
        var ledge2 = this.matter.add.image(50, 250, 'ground', null, {label: 'floor'}).setStatic(true);
        //@ts-ignore
        var ledge3 = this.matter.add.image(750, 220, 'ground', null, {label: 'floor'}).setStatic(true);

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        /*
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        */
        
        this.stars = this.matter.add.imageStack('star', null, 0, 0, 11, 1, 53.5, 0, {label: 'star'}); //{ _mass: 0.5 } is omitted ... 53.5 = (800 - 24) / 10 - 24 - 0.1
        

        
;
        /*
        this.stars.bodies.iterate(function (child) {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });
        */

        // ++ is there to add bounce to just one direction?
        
        var starsChildren = this.stars.bodies;

        for (var i = 0; i < starsChildren.length; i += 1) {
            starsChildren[i].restitution = Phaser.Math.FloatBetween(0.6, 0.8);
        }
        

        //this.bombs = this.physics.add.group();
        

        //@ts-ignore ... The score
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        var firstBall: Phaser.Physics.Matter.Sprite;
        var lastBall: Phaser.Physics.Matter.Sprite;
        
        /*
        //@ts-ignore
        var dummy1Ball = this.matter.add.image(this.player.x + 10, this.player.y - 10, 'ball', null, { shape: 'circle', friction: 0.005, restitution: 0.6 });
        //@ts-ignore
        var dummy2Ball = this.matter.add.image(this.player.x + 20 , this.player.y - 20, 'ball', null, { shape: 'circle', friction: 0.005, restitution: 0.6 });
        //@ts-ignore
        var contraintBetweenPreviousAndCurrent = this.matter.add.constraint(dummy1Ball, dummy2Ball, 20, 0.2, {label: 'joint'});

        console.log(contraintBetweenPreviousAndCurrent);
        */
        var composite = this.matter.composite;
        var composites = this.matter.composites;
        //var chain = composite.create();
        
        this.input.keyboard.on(
            'keydown-Z', 
            function(event){
                
                if (this.ropeNumber == 1){
                    return;
                }

                var previousBall
                if (this.cursors.left.isDown){
                    previousBall = this.matter.add.image(this.player.x - 40, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                    firstBall = previousBall;
                    this.arrayToBeDestroyed.push(firstBall);
                    lastBall = previousBall;
                    (lastBall.body as MatterJS.BodyType).label = "lastball";
                    this.ropeWithTwoEnds = this.matter.add.constraint(this.player.body, firstBall, 80, 1, {label: 'joint', render: {visible: true}});
                    this.arrayToBeDestroyed.push(this.ropeWithTwoEnds); 
                }
                else if (this.cursors.right.isDown){
                    previousBall = this.matter.add.image(this.player.x + 40, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                    firstBall = previousBall;
                    //composite.add(chain, firstBall);
                    this.arrayToBeDestroyed.push(firstBall);
                    
                    for (var i = 0; i < 0; i++){
                        var currentBall = this.matter.add.image(previousBall.x + 10, previousBall.y - 10, 'ball', null, { shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                        //composite.add(chain, currentBall);
                        var contraintBetweenPreviousAndCurrent = this.matter.add.constraint(previousBall, currentBall, 10, 0.5, {label: 'joint', render: {visible: true}});
                        this.arrayToBeDestroyed.push(currentBall);
                        this.arrayToBeDestroyed.push(contraintBetweenPreviousAndCurrent);
                        previousBall = currentBall;
                    }
                    lastBall = previousBall;
                    (lastBall.body as MatterJS.BodyType).label = "lastball";
                    //console.log(lastBall);
                    //composite.add(chain, lastBall);
                    //console.log(lastBall);
                    this.ropeWithTwoEnds = this.matter.add.constraint(this.player.body, firstBall, 80, 1, {label: 'joint', render: {visible: true}});
                    this.arrayToBeDestroyed.push(this.ropeWithTwoEnds);
                    console.log(this.ropeWithTwoEnds);
                    //++ don't understand why this does not work
                    /*
                    composites.chain(
                        chain, 0.3, 0, -0.3, 0, {
                        stiffness: 1,
                        length: 10,
                        render: {
                            visible: false
                        }
                        }
                    );
                    */
                }
                else{
                    previousBall = this.matter.add.image(this.player.x, this.player.y - 40, 'ball', null, { isSensor: true, shape: 'circle', friction: 0.005, restitution: 0.6, collisionFilter: { group: group } }).setScale(0.2);
                    firstBall = previousBall;
                    this.arrayToBeDestroyed.push(firstBall);
                    lastBall = previousBall;
                    (lastBall.body as MatterJS.BodyType).label = "lastball";
                    this.ropeWithTwoEnds = this.matter.add.constraint(this.player.body, firstBall, 80, 1, {label: 'joint', render: {visible: true}});
                    this.arrayToBeDestroyed.push(this.ropeWithTwoEnds); 
                }
                
                this.ropeNumber += 1;
                console.log(this.ropeNumber);
            }, 
            this
        );

        console.log(this.player);
        this.player.setMass(0.1);
        console.log(this.player);
        
        this.matter.world.on(
            'collisionstart',
            function(event){
                //console.log(event);
                var pairs = event.pairs;

                for (var i = 0; i < pairs.length; i++)
                {
                    var bodyA = pairs[i].bodyA;
                    var bodyB = pairs[i].bodyB;
                    //var bodyASprite = bodyA.gameObject;
                    //var bodyBSprite = bodyB.gameObject;

                    //var floorSprite;
                    //var playerSprite;
                    //var color;
                    //console.log(bodyA);
                    //console.log(bodyB);
                    if ((bodyA.label == 'player' && bodyB.label == 'floor' && bodyA.position.y <= bodyB.position.y - bodyB.centerOffset.y) ||
                    (bodyA.label == 'floor' && bodyB.label == 'player' && bodyA.position.y <= bodyB.position.y - bodyB.centerOffset.y))
                    {
                        /*
                        color = 0x00ff00;
                        floorSprite = bodyBSprite;
                        playerSprite = bodyASprite;
                        floorSprite.setTintFill(color);
                        */
                        Play.onFloor = true;
                        //console.log(this.onFloor);
                    }

                    else if ((bodyA.label == 'player' && bodyB.label == 'star') || (bodyA.label == 'star' && bodyB.label == 'player'))
                    {
                        //  Add and update the score
                        this.score += 10;
                        this.scoreText.setText('Score: ' + this.score);
                        //bodyB.destroy();
                        bodyB.gameObject.destroy();
                        //bodyB.gameObject.disableBody(true, true); // ++ is it possible to desable the body?
                        if (this.stars.bodies.length == 0){
                            this.stars = this.matter.add.imageStack('star', null, 0, 0, 11, 1, 53.5, 0, {label: 'star'});
                            var bomb : Phaser.Physics.Matter.Image = this.matter.add.image(Phaser.Math.Between(32, 768), 20, 'bomb', Phaser.Math.Between(0, 5), {label: 'redball'});
                            bomb.setBounce(0.99); // ++ Math.max(bodyA.restitution, bodyB.restitution) does not seems to work

                            bomb.setFriction(0); 
                            bomb.setFrictionAir(0.01);
                            this.matter.body.setInertia(bomb.body as MatterJS.BodyType, Infinity);
                            //(bomb.body as MatterJS.BodyType).restitution = 1.0;
                            bomb.setVelocity(Phaser.Math.Between(-5, 5), 0);
                        }   
                    }
                    else if ((bodyA.label == 'player' && bodyB.label == 'redball') || (bodyA.label == 'redball' && bodyB.label == 'player'))
                    {
                        this.hitBomb(this.player);
                        
                    }
                    
                    else if ((bodyA.label == 'lastball' && bodyB.label == 'floor' && bodyB.position.y < this.player.y) ||
                    (bodyA.label == 'floor' && bodyB.label == 'lastball' && bodyA.position.y < this.player.y) && Play.hanging == false) 
                    {
                        console.log('lastballhitfloorupper');
                        var constraintBetweenWorldPointAndLastBall = 
                        this.matter.add.worldConstraint(lastBall, 10, 1, {
                            pointA: { x: lastBall.x, y: lastBall.y }, 
                            pointB: { x: 0, y: 0 }
                        });
                        this.arrayToBeDestroyed.push(constraintBetweenWorldPointAndLastBall);
                        //(lastBall.body as MatterJS.BodyType).label = "nolongerlastball";
                        Play.hanging = true;
                    }
                    
                    else if (((bodyA.label == 'floor' && bodyB.label == 'lastball') || (bodyA.label == 'lastball' && bodyB.label == 'floor')) && Play.hanging == false)
                    {
                        console.log('lastballhitfloorlower');
                        /*
                        for (var i = 0; i < arrayToBeDestroyed.length; i += 1) {
                            
                            if (arrayToBeDestroyed[i].label && arrayToBeDestroyed[i].label == 'joint'){
                                arrayToBeDestroyed[i].bodyA.destroy();
                                arrayToBeDestroyed[i].bodyB.destroy();
                            }
                            else{
                                console.log(arrayToBeDestroyed[i]);
                                arrayToBeDestroyed[i].body.gameObject.destroy();
                            }
                            
                            //console.log(arrayToBeDestroyed[i]);
                        }*/

                        for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                            //console.log("i :");
                            //console.log(i);
                            //console.log(arrayToBeDestroyed[i]);
                            if (this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint' ){
                                
                                this.matter.world.removeConstraint(this.arrayToBeDestroyed[i])
                                //console.log(arrayToBeDestroyed[i]);
                                
                                //console.log('here4');
                                //console.log(arrayToBeDestroyed.length)
                                //console.log(arrayToBeDestroyed[i]);
                                //arrayToBeDestroyed[i].body.gameObject.destroy();
                                //console.log(arrayToBeDestroyed.length)
                                //this.matter.world.remove(arrayToBeDestroyed[i].body.gameObject, true);
                                
                            }
                            
                            //console.log(arrayToBeDestroyed[i]);
                        }

                        for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                            if (!(this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint') && this.arrayToBeDestroyed[i].body){
                                this.arrayToBeDestroyed[i].body.gameObject.destroy();
                                this.arrayToBeDestroyed[i].destroy();
                            }
                            //console.log(arrayToBeDestroyed[i]);
                        }
                        //console.log(firstBall);
                        //console.log(lastBall);
                        this.arrayToBeDestroyed = [];
                        this.ropeNumber -= 1;
                        console.log(this.ropeNumber);
                        
                        

                        //this.matter.world.remove(arrayToBeDestroyed); //++ don't understand why this does not work
                        //firstBall.body.gameObject.destroy();
                        //lastBall.body.gameObject.destroy();
                    }

                }
            },
            this
        );
        
        this.matter.world.on(
            'collisionend',
            function(event){
                var pairs = event.pairs;

                for (var i = 0; i < pairs.length; i++)
                {
                    var bodyA = pairs[i].bodyA;
                    var bodyB = pairs[i].bodyB;
                    if (bodyA.label == 'player' && bodyB.label == 'floor'){
                        Play.onFloor = false;
                        //console.log('here2');
                    }
                    else if (bodyA.label == 'floor' && bodyB.label == 'player')
                    {
                        Play.onFloor = false;
                        //console.log('here3');
                    }
                }
            }
        );
        
        /*
        var group = this.matter.world.nextGroup(true);

        var bridge = this.matter.add.stack(160, 290, 15, 1, 0, 0, function(x, y) {
            //@ts-ignore
            return Phaser.Physics.Matter.Matter.Bodies.rectangle(x - 20, y, 53, 20, { 
                collisionFilter: { group: group },
                chamfer: 5,
                density: 0.005,
                frictionAir: 0.05
            });
        });

        this.matter.add.chain(bridge, 0.3, 0, -0.3, 0, {
            stiffness: 1,
            length: 0,
            render: {
                visible: false
            }
        });

        this.matter.add.rectangle(30, 490, 220, 380, {
            isStatic: true, 
            chamfer: { radius: 20 }
        });
    
        this.matter.add.rectangle(770, 490, 220, 380, {
            isStatic: true, 
            chamfer: { radius: 20 }
        }),
        
    
        this.matter.add.worldConstraint(bridge.bodies[0], 2, 0.9, {
            pointA: { x: 140, y: 300 }, 
            pointB: { x: -25, y: 0 }
        });
    
        this.matter.add.worldConstraint(bridge.bodies[bridge.bodies.length - 1], 2, 0.9, {
            pointA: { x: 660, y: 300 }, 
            pointB: { x: 25, y: 0 }
        });
        */
       
        
        
        /*
        this.input.on(
            'pointerdown', 
            function(pointer){
                if (pointer.isDown){
                    var group = this.matter.world.nextGroup(true);
                    var bridge = this.matter.add.stack(160, 290, 15, 1, 0, 0, function(x, y) {
                        //@ts-ignore //++why this has to be ignored
                        return Phaser.Physics.Matter.Matter.Bodies.rectangle(x - 20, y, 53, 20, { 
                            collisionFilter: { group: group },
                            chamfer: 5,
                            density: 0.005,
                            frictionAir: 0.05
                        });
                    });
                }
            }, 
            this
        );
        */

    
        

        //  Collide the player and the stars with the platforms
        //this.physics.add.collider(this.player, this.platforms);
        //this.physics.add.collider(this.stars, this.platforms);
        //this.physics.add.collider(this.bombs, this.platforms);
        //this.player.setCollisionGroup(-1)
        
        

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        //this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        //this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        /*
        this.matter.world.setBounds();

        var sides = 6;
        var size = 14;
        var distance = size * 4;
        var stiffness = 0.1;
        var lastPosition = new Phaser.Math.Vector2();
        var options = { friction: 0.005, frictionAir: 0, restitution: 1 };
        var pinOptions = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true, inertia: Infinity, isStatic: true };

        var current = null;
        var previous = null;

        this.input.on('pointerdown', function (pointer) {

            lastPosition.x = pointer.x;
            lastPosition.y = pointer.y;

            previous = this.matter.add.polygon(pointer.x, pointer.y, sides, size, pinOptions);

        }, this);

        this.input.on('pointermove', function (pointer) {

            if (pointer.isDown)
            {
                var x = pointer.x;
                var y = pointer.y;

                if (Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y) > distance)
                {
                    lastPosition.x = x;
                    lastPosition.y = y;

                    current = this.matter.add.polygon(pointer.x, pointer.y, sides, size, options);

                    this.matter.add.constraint(previous, current, distance, stiffness);

                    previous = current;
                }
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            previous.isStatic = true;
            previous.ignoreGravity = true;

        }, this);
        */
       
    }
    
    /*
    collectStar (player, star){

        star.disableBody(true, true);

        //  Add and update the score
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0)
        {
            //  A new batch of stars to collect
            this.stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
    */

    hitBomb (player, bomb){

        console.log('hereend');
        this.matter.pause()
        //this.physics.pause();

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


        //console.log(Play.onFloor);
        if (this.cursors.up.isDown && Play.onFloor == true)
        {
            this.player.setVelocityY(-9);
        }
        if (this.cursors.up.isDown && Play.hanging == true)
        {
            if (this.ropeWithTwoEnds.length > 40){
                this.ropeWithTwoEnds.length -= 1;
            }
            
        }
        if (this.cursors.down.isDown && Play.hanging == true)
        {
            if (this.ropeWithTwoEnds.length < 80){
                this.ropeWithTwoEnds.length += 1;
            }
            
        }
        if (this.cursors.space.isDown)
        {
            console.log('space is down');
            if (Play.hanging == true){
                this.matter.world.remove(this.arrayToBeDestroyed);
                Play.hanging = false;
                for (var i = 0; i < this.arrayToBeDestroyed.length; i += 1) {
                    if (!(this.arrayToBeDestroyed[i].label && this.arrayToBeDestroyed[i].label == 'joint') && this.arrayToBeDestroyed[i].body){
                        this.arrayToBeDestroyed[i].body.gameObject.destroy();
                        this.arrayToBeDestroyed[i].destroy();
                    }
                    //console.log(arrayToBeDestroyed[i]);
                }
                this.ropeNumber -= 1;
                console.log(this.ropeNumber);
            }
            
        }

        
    }
}
