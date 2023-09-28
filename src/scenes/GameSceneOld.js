
var explosions;
var asteroid_health_decrement
var sampleRate;



class GameScene extends Phaser.Scene {

    constructor(key) {
        super({
            key: key,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { y: 0 },
                    setBounds: true,
                    width: 800,
                    height: 600,
                    x: 0,
                    y: 0,
                    checkCollision: {
                        up: true,
                        down: true,
                        left: true,
                        right: true
                    }
                }
            },
        });
    }


    init(data) {

        // If no top score, set to zero
        if (!data) {
            this.topScore = 0;
        }

        if (data) {
            if (data.score > this.topScore) {
                this.topScore = data.score;
            }           
        }

        this.hole = null;
        this.hole2 = null;

        this.cursors = this.input.keyboard.createCursorKeys();

        // Flag to stop game over screen from appearing multiple times
        this.gameOverFlag = false;

    }

    

    preload() {

        // Images

        // Ship
        this.load.image('ship', './assets/thrust_ship.png');
        this.load.image('fire', './assets/flame2.png');

        // Background
        this.load.image('space', './assets/space2.png')

        // Asteroids
        this.load.image('ast1', './assets/asteroid1.png');
        this.load.image('ast2', './assets/asteroid2.png');
        this.load.image('ast3', './assets/asteroid3.png');
        this.asteroid_textures = ['ast1', 'ast2', 'ast3']


        // Explosion
        this.load.spritesheet('kaboom', './assets/explode.png', {
            frameWidth: 128,
            frameHeight: 128
        });

    }

    
    add_updates(delay, beaconLag, xVelocity) {
        
        // Update the asteroids
        this.asteroidEvent = this.time.addEvent({
            delay: delay,
            callback: this.updateAsteroids,
            args: [beaconLag, xVelocity],
            callbackScope: this,
            loop: true
        });


    }

    create() {

        // Add explosions, from here https://github.com/robhimslf/game-dev-invaders
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers( 'kaboom', {
                start: 0,
                end: 15
            }),
            frameRate: 16,
            repeat: 0,
            hideOnComplete: true
        });

        explosions = this.add.group({
            defaultKey: 'kaboom',
            maxSize: 10,
            active: false
        });


        // Turn off gravity. There is no gravity in space.
        this.physics.gravity = 0;

        // Background
        this.space = this.physics.add.image(400, 300, 'space');

        // Fire behind the spaceship
        this.fire = this.physics.add.image(225, 345, 'fire').setActive().setVelocity(0, 0);
        this.fire.setRotation(4.71);
        this.fire.setScale(0.3, 0.3);
        this.fire.collideWorldBounds = true;

        // The spaceship itself
        this.ship = this.physics.add.image(200, 300, 'ship').setActive().setVelocity(0, 0);
        this.ship.setCollideWorldBounds(true);
        this.ship.onWorldBounds = true;
        this.ship.depth = 20;
        // console.log(this.ship)

        // key for attention checks
        this.attentionCheckKey = this.input.keyboard.addKey('D');  // Get key object

        // Shield bar
        this.ship.health = 1;

        var graphics = this.add.graphics();
        this.healthBar = new Phaser.Geom.Rectangle(30, 40, 140, 20);
        graphics.fillStyle(0x1dadf7, 1);
        graphics.fillRectShape(this.healthBar);

        var graphicsBackground = this.add.graphics();
        this.healthBarBackground = new Phaser.Geom.Rectangle(30, 40, 140, 20);
        graphicsBackground.fillStyle(0xe2e2e2, 1);
        graphicsBackground.fillRectShape(this.healthBarBackground);


        // Update health bar
        this.healthEvent = this.time.addEvent({
            delay: 50,
            callback: function() {

                graphics.clear();
                graphicsBackground.setDepth(1999);
                graphics.setDepth(2000);

                var w = 140 * this.ship.health;
                this.healthBar.setSize(w, 20);

                if (this.ship.health <= 0.3) {
                    graphics.fillStyle(0xff9400, 1);
                }
                else {
                    graphics.fillStyle(0x1dadf7, 1);
                }

                graphics.fillRectShape(this.healthBar);
            },
            callbackScope: this,
            loop: true
        });


        // Add asteroids
        this.asteroids = this.physics.add.group({
            key: 'asteroid',
            repeat: 24,
            setXY: { x: 700, y: 10, stepY: 25 },
            setVelocityX: 0
        });

        // Set texture of the asteroids
        this.asteroids.children.iterate(function (child) {
            child.setTexture(this.asteroid_textures[Phaser.Math.Between(0, 2)]);
            child.setX(2000);
        }, this);
        this.asteroids.depth = 0;


        // Collider - lets us know when the ship has hit an asteroid
        this.collider = this.physics.add.overlap(this.ship, this.asteroids, this.collide);

        // Instruction text
        this.instructionText = this.make.text({    
            style: {
            font: '25px Rubik',
            fill: 'white',
        }}).setX(400).setY(50).setDepth(2000).setAlign('center').setOrigin(0.5);

        this.countdownText = this.make.text({    
            style: {
            font: '70px Rubik',
            fill: 'white',
        }}).setX(400).setY(300).setDepth(2000).setAlign('center').setOrigin(0.5);

        // Shield text
        this.shieldText = this.make.text({    
                style: {
                font: '15px Rubik',
                fill: 'white',
        }}).setText(this.scoreVal).setX(30).setY(20).setDepth(2000);

        // Score
        this.scoreVal = 0;
        this.scoreLabel = this.make.text({    
            style: {
            font: '15px Rubik',
            fill: 'white',
        }}).setText(this.scoreVal).setX(30).setY(540).setDepth(2000);

        this.score = this.make.text({    
                style: {
                font: '35px Rubik',
                fill: 'white',
        }}).setText(this.scoreVal).setX(30).setY(550).setDepth(2000);

        // Progress
        this.progressVal = 0;
        this.progressLabel = this.make.text({    
            style: {
            font: '15px Rubik',
            fill: 'white',
        }}).setText('Progress:').setX(30).setY(490).setDepth(2000);

        this.progress = this.make.text({    
                style: {
                font: '20px Rubik',
                fill: 'white',
        }}).setText(this.cache.game.player_trial + ' / ' + this.cache.game.n_trials).setX(30).setY(510).setDepth(2000);

        // Update score every few milliseconds
        this.scoreEvent = this.time.addEvent({
            delay: 100,
            callback: function() {
                this.scoreVal += this.cache.game.score_increment;
            },
            callbackScope: this,
            loop: true
        });


        // keep track of trials
        this.last_asteroid = null;

        // We need to see things
        var graphics = this.add.graphics();

        // Update asteroids and beacons
        this.updatesAdded = 0;
        // this.add_updates(3100);

        // This is after a game over screen
        // Set everything to starting conditions
        this.instructionText.setText('');
        this.countdownText.setText('');
        // Start the asteroids and beacons updating
        this.add_updates(3100, 2600, this.cache.game.asteroid_velocity);
        this.practicePhase = 999;
        this.ship.health = 1;

        // Text to show shield integrity
        this.shieldText.setText('Shields');

        // Text to show score
        this.scoreLabel.setText('Score:')
        
        // Score indicator z
        this.score.depth = 1000;

        // Data save, will be updated later
        this.dataSaveEvent = null;
        // console.log(this.cache.game.player_trial);

        // Attention check
        this.attentionCheck = false;

        // 
        this.trialUpdate = null;
        this.attentionUpdate = null;
    }

    // Update - runs constantly
    update() {
        
        // Ensure gravity remains off
        this.physics.gravity = 0;

        // Make sure the spaceship doesn't move horizontally
        this.ship.x = 200;
        
        // Add fire
        this.fire.x = this.ship.x - 20;
        this.fire.y = this.ship.y;

        if (this.cursors.up.isDown) {
            this.ship.body.velocity.y -= 20;
            this.fire.body.velocity.y -= 20;
            this.fire.visible = true;
        }

        else if (this.cursors.down.isDown) {
            this.ship.body.velocity.y += 20;
            this.fire.body.velocity.y += 20;
            this.fire.visible = true;
        }

        else {
            this.ship.body.velocity.y *=0.98;
            this.fire.body.velocity.y *=0.98;
            this.fire.visible = false;
        }

        // Attention check
        if (this.attentionCheck == true) {
            if (this.attentionCheckKey.isDown) {
                this.cache.game.attention_checks.push(true);
                this.instructionText.setText('');
                this.attentionCheck = false;
                this.attentionUpdate = null;
            }
        }

        // Text to show score
        this.score.setText(this.scoreVal);

        // Constantly increase ship health and boost
        if (this.ship.health < 1) {
            this.ship.health += this.cache.game.health_increase; // 0.00012
        }

        // Update trial count
        if (this.last_asteroid != null &&
            this.ship.x > this.last_asteroid.x + 400 &&
            (this.cache.game.trial - this.cache.game.player_trial == 1)) {

                // Attention check
                if ([4, 40, 70].includes(this.cache.game.trial)) {
                    this.instructionText.setText('!! Attention check !!\nPlease press the D key');
                    this.attentionCheck = true;
                    if (this.attentionUpdate == null) {
                        this.attentionUpdate = this.time.addEvent({
                            delay:5000,
                            callback: function() {
                                if (this.attentionCheck == true) {
                                    this.instructionText.setText('');
                                    this.cache.game.attention_checks.push(false);
                                    // console.log(this.cache.game.attention_checks);
                                    this.attentionCheck = false;
                                    this.attentionUpdate = null;
                                }
                            },
                            callbackScope: this,
                            loop: false
                        })
                    }
                }

                if (this.trialUpdate == null) {
                    this.trialUpdate = this.time.addEvent({
                        delay:500,
                        callback: function() {
                            if (this.cache.game.player_trial != this.cache.game.trial & this.cache.game.trial - this.cache.game.player_trial == 1) {
                                this.cache.game.player_trial += 1;
                                this.trialUpdate = null;
                                this.progress.setText(this.cache.game.player_trial + ' / ' + this.cache.game.n_trials)
                            }
                        },
                        callbackScope: this,
                        loop:false
                    })
                }

                
            if (this.dataSaveEvent != null) {
                this.dataSaveEvent.remove();
            }
            
        }

        // End task if last trial done
        if (this.cache.game.player_trial >= this.cache.game.n_trials) {
            this.nextPhase();
        }

        asteroid_health_decrement = this.cache.game.asteroid_health_decrement;

    }


    // Collision between ship and asteroid
    collide(bodyA, bodyB, axis, context, health_decrement)
    {

        // Lower health
        bodyA.health -= asteroid_health_decrement; 

        // ADD EXPLOSION
        var explosion = explosions.get();
        explosion.setScale(0.6, 0.6);
        explosion.setOrigin( 0.8, 0.5 );
        explosion.x = bodyB.x;
        explosion.y = bodyB.y;;
        explosion.play('explode');


        // Hide asteroid
        bodyB.x = -99999999999;
        bodyB.checkCollision = false;

        // Make ship a bit red
        bodyA.setTint('0xff0000');

        // But only for a second
        bodyA.scene.time.addEvent({
            delay: 1000,
            callback: function() {
                if (bodyA.health <= 0.2) {
                    bodyA.setTint('0xff0000');
                }
                else {
                    bodyA.setTint();
                }

            },
            callbackScope: this,
            loop: false
        });

        // End game if health goes to zero
        if (bodyA.health <= 0.01 && !bodyA.scene.gameOverFlag) {
            bodyA.scene.gameOverFlag = true;
            bodyA.scene.gameOver()
        }

        if (this.dataSaveEvent != null) {
            this.dataSaveEvent.remove();
        }

    }

    // Create new asteroid belt
    updateAsteroids(beaconLag, xVelocity) {

        // Reset explosions
        explosions = this.add.group({
            defaultKey: 'kaboom',
            maxSize: 10
        });
        // console.log(this.cache.game.trial);
        // Get position of holes in the asteroid belt
        this.hole = this.cache.game.trial_info.positions_A[this.cache.game.trial];
        this.hole2 = this.cache.game.trial_info.positions_B[this.cache.game.trial];

        // Position asteroids - asteroids are already created and are just moved into position on each trial, so we're not constantly creating new objects
        var max_val = 0;
        this.last_asteroid = null;
        for (let i = 0; i < this.asteroids.getChildren().length; i++) {
            var childAsteroid = this.asteroids.getChildren()[i];
            childAsteroid.setDepth(0);
            var val = Phaser.Math.Between(beaconLag, beaconLag+200);

            // Create the hole
            if ((i < this.hole - 3 || i > this.hole) && (i < this.hole2 || i > this.hole2 + 3)) {
                childAsteroid.setX(val);
                childAsteroid.setVelocity(xVelocity, 0);
                if (val > max_val) {
                    max_val = val;
                    this.last_asteroid = childAsteroid;
                }
            }
            else {
                childAsteroid.setX(99999);

            }
        }

        // Adjust post-outcome duration
        this.asteroidEvent.paused = true;
        this.asteroidDelay = this.time.addEvent({
            delay: this.cache.game.iti,
            callback: function() { 
                this.asteroidEvent.paused = false;
            },
            callbackScope: this,
            loop: false
        });

        // DATA SAVING
        this.cache.game.data[this.cache.game.player_trial] = {
            trial_number: this.cache.game.trial,
            hole1_y: this.hole,
            hole2_y: this.hole2,
            score: this.scoreVal,
            health: this.ship.health,
            player_y: [this.ship.y],
            game_over: false,
        }

        // Add player Y positions
        sampleRate = this.cache.game.sampleRate;
        if (this.practicePhase == 999) {
            this.dataSaveEvent = this.time.addEvent({
                delay: 1000 / sampleRate,
                callback: function () {
                    if (this.cache.game.player_trial in this.cache.game.data) {
                        this.cache.game.data[this.cache.game.player_trial]['player_y'].push(this.ship.y);
                    }
                },
                callbackScope: this,
                loop: true,
            });
        }

        // Add trial
        this.cache.game.trial += 1;

    }


    gameOver() {

        // Stop keyboard input
        
        this.cursors.up.isDown = false;
        this.cursors.down.isDown = false;

        // Calculate scores
        if (!this.topScore) {
            this.topScore = this.scoreVal;
        }

        else if (this.scoreVal > this.topScore) {
            this.topScore = this.scoreVal;
        }

        // Show game over screen
        this.scene.start('GameOver', {score: this.scoreVal, topScore: this.topScore, game: 'game'});

    }

    nextPhase() {

        this.cursors.up.isDown = false;
        this.cursors.down.isDown = false;

        this.ship.body = false;
        this.asteroids.body = false;
        this.fire.body = false;
        this.space.body = false;

        if (!this.topScore) {
            this.topScore = this.scoreVal;
        }

        else if (this.scoreVal > this.topScore) {
            this.topScore = this.scoreVal;
        }

        this.scene.start('EndScene', {score: this.scoreVal, topScore: this.topScore});

    }
}

export default GameScene;