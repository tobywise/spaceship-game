class GameStart extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameStart',
        });
    }

    create() {
        this.text = this.make.text({    
            style: {
            font: '20px Rubik',
            fill: 'white',
        }});
        this.text.x = 400;
        this.text.y = 300;
        this.text.originX = 0.5;
        this.text.originY = 0.5;

        if (this.cache.game.testing == 'TRUE') {
            this.cache.game.n_trials = 2;
        }
        else {
            this.cache.game.n_trials = this.cache.game.trial_info.positions_A.length;
        }
        
        this.text.setText('Welcome!\n\n' +
            'Your task is to pilot a spaceship and avoid asteroids\n\n' +
            'The game ends when you pass (or crash into) ' + this.cache.game.n_trials + ' asteroid belts,\n\nregardless of how much you get hit\n\n' +
            'Press space to begin!');
        this.text.setAlign('center');


    }

    update() {

        var cursors = this.input.keyboard.createCursorKeys();

        if (cursors.space.isDown) {
            cursors.space.isDown = false;
            this.scene.start('GameScene', {
                score: this.scoreVal,
                practice: true
            });
        }
    }


}

export default GameStart;