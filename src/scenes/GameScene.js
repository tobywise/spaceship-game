var explosions;

class GameScene extends Phaser.Scene {
    // Constructor to set up the scene's configuration and initial state
    constructor(key) {
        super({
            key: key,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false, // Set to true to view zones and debug info
                    gravity: { y: 0 }, // The gravity affecting bodies in this scene
                    setBounds: true, // Whether to create a boundary around the scene
                    width: 800,
                    height: 600,
                    x: 0,
                    y: 0, // Dimensions and position of the boundary
                    checkCollision: {
                        up: true,
                        down: true,
                        left: true,
                        right: true,
                    }, // Set boundaries to be collidable
                },
            },
        });
    }

    // Initialization method to set up the scene's state before it's created
    init(data = {}) {
        // If no top score, set to zero
        if (!data) {
            this.topScore = 0;
        }

        if (data) {
            if (data.score > this.topScore) {
                this.topScore = data.score;
            }           
        }

        // Set up cursor keys for player input
        this.cursors = this.input.keyboard.createCursorKeys();

        this.hole = null; // Placeholder for a game object
        this.hole2 = null; // Placeholder for a second game object
        this.gameOverFlag = false; // Flag to determine if the game is over
    }

    // Preload method to load assets before the scene is created
    preload() {
        // Load the images and spritesheets needed for this scene
        this.loadImages();

        // Load a spritesheet for explosion animations
        this.load.spritesheet("kaboom", "./assets/explode.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
    }

    // Custom method to load image assets, for organization and readability
    loadImages() {
        const imagePath = "./assets/";

        // Load individual images for the scene
        this.load.image("ship", `${imagePath}thrust_ship.png`);
        this.load.image("fire", `${imagePath}flame2.png`);
        this.load.image("space", `${imagePath}space2.png`);
        this.load.image("ast1", `${imagePath}asteroid1.png`);
        this.load.image("ast2", `${imagePath}asteroid2.png`);
        this.load.image("ast3", `${imagePath}asteroid3.png`);

        // Array to hold texture keys for asteroids
        this.asteroid_textures = ["ast1", "ast2", "ast3"];
    }

    // Method to initialize periodic updates to the game state
    add_updates(delay, xVelocity) {
        // Schedule a repeating event to update the asteroids
        // delay: The time to wait between calls to the callback, in ms
        // xVelocity is passed as arguments to the callback
        // loop: true to make the event repeat at the specified delay
        this.asteroidEvent = this.time.addEvent({
            delay: delay,
            callback: this.updateAsteroids,
            args: [xVelocity],
            callbackScope: this,
            loop: true,
        });
    }

    create() {
        // Initialize scene, create animations, objects, and set up event handlers

        // ========================
        // Creating Animations
        // ========================
        if (!this.anims.get('explode')) {
            this.anims.create({
                key: "explode",
                frames: this.anims.generateFrameNumbers("kaboom", {
                    start: 0,
                    end: 15,
                }),
                frameRate: 16,
                repeat: 0,
                hideOnComplete: true,
            });
        }

        // ========================
        // Initializing Groups and Physics
        // ========================
        explosions = this.add.group({
            defaultKey: "kaboom",
            maxSize: 10,
        });

        this.physics.gravity = 0; // Set gravity to 0, since there is no gravity in space

        // ========================
        // Creating Scene Objects
        // ========================
        this.space = this.physics.add.image(400, 300, "space");
        this.fire = this.initializeFire();
        this.ship = this.initializeShip();
        this.asteroids = this.initializeAsteroids();
        this.collider = this.physics.add.overlap(
            this.ship,
            this.asteroids,
            this.collide,
            null,
            this
        );

        // ========================
        // Setting up UI Elements
        // ========================
        this.initializeUI();

        // ========================
        // Setting Up Events
        // ========================
        // first value is when asteroids are refreshed, second is where they are positioned when they start
        this.add_updates(3100, this.cache.game.asteroid_velocity); // Start updating asteroids

        this.dataSaveEvent = null;
        this.trialUpdate = null;
        this.attentionUpdate = null;

        // Initialize Variables
        this.updatesAdded = 0;
        this.practicePhase = 999;
        this.attentionCheck = false;
        this.ship.health = 1;

        // Attention Check Key
        this.attentionCheckKey = this.input.keyboard.addKey(
            this.cache.game.attention_check_key
        ); // Get key object

        // Assume scene is the current active scene, and yourGameObject is the object to be animated
        this.tweens.add({
            targets: this.ship,
            x: '+=5',
            ease: 'Sine.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

    }

    initializeFire() {
        const fire = this.physics.add.image(225, 345, "fire");
        fire.setActive()
            .setVelocity(0, 0)
            .setRotation(4.71)
            .setScale(0.3, 0.3)
            .setCollideWorldBounds(true);
        return fire;
    }

    initializeShip() {
        const ship = this.physics.add.image(200, 300, "ship");
        ship.setActive()
            .setVelocity(0, 0)
            .setCollideWorldBounds(true)
            .setDepth(20);
        ship.onWorldBounds = true;
        ship.x = 200;
        return ship;
    }

    initializeAsteroids() {
        const asteroids = this.physics.add.group({
            key: "asteroid",
            repeat: 24,
            setXY: { x: 700, y: 10, stepY: 25 },
        });

        asteroids.children.iterate((child) => {
            child.setTexture(this.asteroid_textures[Phaser.Math.Between(0, 2)]);
            child.setX(2000);
        });
        asteroids.depth = 0;

        return asteroids;
    }

    initializeUI() {
        // Initialize health bar, score, progress, text elements, etc.
        // Set up corresponding event handlers and state variables
        this.initializeHealthBar();
        this.initializeTextElements();
        this.initializeScoreAndProgress();
    }

    initializeHealthBar() {
        // Initialize health bar and related elements
        const graphics = this.add.graphics();
        this.healthBar = new Phaser.Geom.Rectangle(30, 40, 140, 20);
        graphics.fillStyle(0x1dadf7, 1);
        graphics.fillRectShape(this.healthBar);

        const graphicsBackground = this.add.graphics();
        this.healthBarBackground = new Phaser.Geom.Rectangle(30, 40, 140, 20);
        graphicsBackground.fillStyle(0xe2e2e2, 1);
        graphicsBackground.fillRectShape(this.healthBarBackground);

        // Update health bar
        this.healthEvent = this.time.addEvent({
            delay: 50,
            callback: function () {
                graphics.clear();
                graphicsBackground.setDepth(1999);
                graphics.setDepth(2000);

                var w = 140 * this.ship.health;
                this.healthBar.setSize(w, 20);

                if (this.ship.health <= 0.3) {
                    graphics.fillStyle(0xff9400, 1);
                } else {
                    graphics.fillStyle(0x1dadf7, 1);
                }

                graphics.fillRectShape(this.healthBar);
            },
            callbackScope: this,
            loop: true,
        });
    }

    initializeTextElements() {
        // Initialize text elements in the UI
        this.instructionText = this.makeTextElement(
            400,
            50,
            "25px Rubik",
            "white"
        );
        this.countdownText = this.makeTextElement(
            400,
            300,
            "70px Rubik",
            "white"
        );
        this.shieldText = this.makeTextElement(30, 20, "15px Rubik", "white")
            .setText("Shields")
            .setOrigin(0, 0);
        this.scoreLabel = this.makeTextElement(30, 535, "15px Rubik", "white")
            .setText("Score:")
            .setOrigin(0, 0);
        this.progressLabel = this.makeTextElement(
            30,
            490,
            "15px Rubik",
            "white"
        )
            .setText("Progress:")
            .setOrigin(0, 0);
    }

    initializeScoreAndProgress() {
        // Initial values
        this.scoreVal = 0;

        // Initialize score and progress elements
        this.score = this.make
            .text({
                style: {
                    font: "35px Rubik",
                    fill: "white",
                },
            })
            .setText(this.scoreVal)
            .setX(30)
            .setY(550)
            .setDepth(2000);

        this.progress = this.make
            .text({
                style: {
                    font: "20px Rubik",
                    fill: "white",
                },
            })
            .setText(
                this.cache.game.player_trial + " / " + this.cache.game.n_trials
            )
            .setX(30)
            .setY(510)
            .setDepth(2000);

        this.scoreEvent = this.time.addEvent({
            delay: 100,
            callback: function () {
                this.scoreVal += this.cache.game.score_increment;
            },
            callbackScope: this,
            loop: true,
        });
    }

    makeTextElement(x, y, font, fill) {
        // Simplify text element creation
        return this.make
            .text({
                x: x,
                y: y,
                style: {
                    font: font,
                    fill: fill,
                },
            })
            .setDepth(2000)
            .setAlign("center")
            .setOrigin(0.5);
    }

    update() {
        // Update spaceship-related movements and properties
        this.updateSpaceshipAndFire();

        // Check for attention check responses
        this.handleAttentionCheckResponse();

        // Update score display
        this.updateScoreDisplay();

        // Boost the ship's health
        this.boostShipHealth();

        // Check and handle trial updates
        this.handleTrialUpdates();

        // Check if the game should progress to the next phase
        this.checkForNextPhase();
    }



    updateSpaceshipAndFire() {
        // Ensure no gravity
        this.physics.gravity = 0;

        // // Set fixed spaceship position
        // this.ship.x = 200;

        // Position fire relative to spaceship
        this.fire.x = this.ship.x - 20;
        this.fire.y = this.ship.y;

        // Handle movement based on user input
        if (this.cursors.up.isDown) {
            this.ship.body.velocity.y -= 20;
            this.fire.body.velocity.y -= 20;
            this.fire.visible = true;
        } else if (this.cursors.down.isDown) {
            this.ship.body.velocity.y += 20;
            this.fire.body.velocity.y += 20;
            this.fire.visible = true;
        } else {
            this.ship.body.velocity.y *= 0.98;
            this.fire.body.velocity.y *= 0.98;
            this.fire.visible = false;
        }
    }

    updateScoreDisplay() {
        this.score.setText(this.scoreVal);
    }

    boostShipHealth() {
        if (this.ship.health < 1) {
            this.ship.health += this.cache.game.health_increase; // 0.00012
        }
    }

    handleAttentionCheckResponse() {
        if (this.attentionCheck) {
            if (this.attentionCheckKey.isDown) {
                this.cache.game.attention_checks.push(true);
                this.instructionText.setText("");
                this.attentionCheck = false;
                this.attentionUpdate = null;
            }
        }
    }

    handleAttentionCheck() {

        // More Detailed Attention Check Logic
        if (this.cache.game.attention_check_trials.includes(this.cache.game.trial)) {
            this.instructionText.setText(
                "!! Attention check !!\nPlease press the " +
                    this.cache.game.attention_check_key +
                    " key"
            );

            this.attentionCheck = true;
            if (this.attentionUpdate == null) {
                this.attentionUpdate = this.time.addEvent({
                    delay: 5000,
                    callback: function () {
                        if (this.attentionCheck == true) {
                            this.instructionText.setText("");
                            this.cache.game.attention_checks.push(false);
                            this.attentionCheck = false;
                            this.attentionUpdate = null;
                        }
                    },
                    callbackScope: this,
                    loop: false,
                });
            }
        }
    }

    handleTrialUpdates() {
        if (
            this.last_asteroid &&
            this.ship.x > this.last_asteroid.x + 400 &&
            this.cache.game.trial - this.cache.game.player_trial == 1
        ) {

            // Do attention check
            this.handleAttentionCheck();

            if (this.trialUpdate == null) {
                this.trialUpdate = this.time.addEvent({
                    delay: 500,
                    callback: function () {
                        if (
                            (this.cache.game.player_trial !=
                                this.cache.game.trial) &
                            (this.cache.game.trial -
                                this.cache.game.player_trial ==
                                1)
                        ) {
                            this.cache.game.player_trial += 1;
                            this.trialUpdate = null;
                            this.progress.setText(
                                this.cache.game.player_trial +
                                    " / " +
                                    this.cache.game.n_trials
                            );
                        }
                    },
                    callbackScope: this,
                    loop: false,
                });
            }

            // Remove dataSaveEvent if it exists
            if (this.dataSaveEvent != null) {
                this.dataSaveEvent.remove();
            }
        }
    }

    checkForNextPhase() {
        if (this.cache.game.player_trial >= this.cache.game.n_trials) {
            this.nextPhase();
        }
    }

    collide(bodyA, bodyB, axis, context, health_decrement) {
        // Lower health
        this.decrementHealth(bodyA, health_decrement);

        // Handle Explosion Animation
        this.handleExplosion(bodyB);

        // Handle Ship Appearance
        this.handleShipTint(bodyA);

        // End game if health goes to zero
        if (bodyA.health <= 0.01 && !bodyA.scene.gameOverFlag) {
            bodyA.scene.gameOverFlag = true;
            bodyA.scene.gameOver();
        }

        if (this.dataSaveEvent != null) {
            this.dataSaveEvent.remove();
        }
    }

    decrementHealth(bodyA, health_decrement) {
        bodyA.health -= this.cache.game.asteroid_health_decrement;
    }

    handleExplosion(bodyB) {
        var explosion = explosions.get();
        explosion.setScale(0.6, 0.6);
        explosion.setOrigin(0.8, 0.5);
        explosion.x = bodyB.x;
        explosion.y = bodyB.y;
        explosion.play("explode");

        // Hide asteroid
        bodyB.x = -99999999999;
        bodyB.checkCollision = false;
    }

    handleShipTint(bodyA) {
        // Make ship a bit red
        bodyA.setTint("0xff0000");

        // But only for a second
        bodyA.scene.time.addEvent({
            delay: 1000,
            callback: function () {
                if (bodyA.health <= 0.2) {
                    bodyA.setTint("0xff0000");
                } else {
                    bodyA.setTint();
                }
            },
            callbackScope: this,
            loop: false,
        });
    }

    // Create new asteroid belt
    updateAsteroids(xVelocity) {
        // Reset explosions
        this.resetExplosions();

        // Get position of holes in the asteroid belt
        this.setHolesPositions();

        // Position asteroids
        this.positionAsteroids(xVelocity);

        // Adjust post-outcome duration
        this.adjustPostOutcomeDuration();

        // Initialize Data Saving
        this.initializeDataSaving();

        // Add player Y positions
        this.addPlayerYPositions();

        // Increment trial
        this.cache.game.trial += 1;
    }

    resetExplosions() {
        explosions = this.add.group({
            defaultKey: "kaboom",
            maxSize: 10,
        });
    }

    setHolesPositions() {
        this.hole =
            this.cache.game.trial_info.positions_A[this.cache.game.trial];
        this.hole2 =
            this.cache.game.trial_info.positions_B[this.cache.game.trial];
    }

    positionAsteroids(xVelocity) {
        var max_val = 0;
        this.last_asteroid = null;
        for (let i = 0; i < this.asteroids.getChildren().length; i++) {
            var childAsteroid = this.asteroids.getChildren()[i];
            childAsteroid.setDepth(0);
            var val = Phaser.Math.Between(800, 1000);

            // Create the hole
            if (
                (i < this.hole - 3 || i > this.hole) &&
                (i < this.hole2 || i > this.hole2 + 3)
            ) {
                childAsteroid.setX(val);
                childAsteroid.setVelocity(xVelocity, 0);
                if (val > max_val) {
                    max_val = val;
                    this.last_asteroid = childAsteroid;
                }
            } else {
                childAsteroid.setX(99999);
            }
        }
    }

    adjustPostOutcomeDuration() {
        this.asteroidEvent.paused = true;
        this.asteroidDelay = this.time.addEvent({
            delay: this.cache.game.iti,
            callback: function () {
                this.asteroidEvent.paused = false;
            },
            callbackScope: this,
            loop: false,
        });
    }

    initializeDataSaving() {
        this.cache.game.data[this.cache.game.player_trial] = {
            trial_number: this.cache.game.trial,
            hole1_y: this.hole,
            hole2_y: this.hole2,
            score: this.scoreVal,
            health: this.ship.health,
            player_y: [this.ship.y],
            game_over: false,
        };
    }

    addPlayerYPositions() {
        if (this.practicePhase == 999) {
            this.dataSaveEvent = this.time.addEvent({
                delay: 1000 / this.cache.game.sampleRate,
                callback: function () {
                    if (this.cache.game.player_trial in this.cache.game.data) {
                        this.cache.game.data[this.cache.game.player_trial][
                            "player_y"
                        ].push(this.ship.y);
                    }
                },
                callbackScope: this,
                loop: true,
            });
        }
    }

    gameOver() {
        this.disableInput();
        this.calculateScores();
        this.switchToGameOverScene();
    }

    calculateScores() {
        // Calculate scores
        if (!this.topScore || this.scoreVal > this.topScore) {
            this.topScore = this.scoreVal;
        }
    }

    switchToGameOverScene() {
        // Show game over screen
        this.scene.start("GameOver", {
            score: this.scoreVal,
            topScore: this.topScore,
            game: "game",
        });
    }

    nextPhase() {
        this.disableInput();
        this.disableBodies();
        this.calculateScores();
        this.startEndScene();
    }

    disableInput() {
        this.cursors.up.isDown = false;
        this.cursors.down.isDown = false;
    }

    disableBodies() {
        this.ship.body = false;
        this.asteroids.body = false;
        this.fire.body = false;
        this.space.body = false;
    }

    startEndScene() {
        this.scene.start("EndScene", {
            score: this.scoreVal,
            topScore: this.topScore,
        });
    }
}

export default GameScene;
