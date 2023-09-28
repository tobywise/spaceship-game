import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js' // Importing Firestore methods

class GameOver extends Phaser.Scene {

    init(data) {
        // Initialize the scene with data passed from the previous scene.
        this.scoreVal = data.score;
        this.topScore = data.topScore;
        this.game = data.game;
    }

    create() {
        // If only one trial is left, increment the player_trial.
        if (this.cache.game.trial - this.cache.game.player_trial === 1) {
            this.cache.game.player_trial += 1;
        }

        // Create and configure text elements to display on the scene.
        this.createTexts();
        
        // Save the data to Firebase.
        this.saveData();
    }

    createTexts() {
        // Create gameOverText and text elements with the specified configurations.
        // These texts include game over message, scores, and instructions.
        this.gameOverText = this.createText('GAME OVER', 50, 'Bungee Shade', 400, 100);
        
        this.text = this.createText(
            `Your score: ${this.scoreVal}\n\nTop score: ${this.topScore}` +
            `\n\n\nPress space to play again!\n\nThe game will continue until you pass (or crash into) ${this.cache.game.n_trials} asteroid belts` +
            `\n\nin total, regardless of how many times you see this screen`,
            15, 'Rubik', 400, 300
        );
    }

    createText(content, fontSize, fontFamily, x, y) {
        // This method creates a text game object with the specified parameters.
        // content: The text to display
        // fontSize, fontFamily: Font properties
        // x, y: Position of the text on the screen
        const text = this.make.text({
            style: {
                font: `${fontSize}px ${fontFamily}`,
                fill: 'white',
            }
        });
        
        // Setting position and origin of the text
        text.x = x;
        text.y = y;
        text.originX = 0.5;
        text.originY = 0.5;

        // Applying the content and aligning it to center.
        text.setText(content);
        text.setAlign('center');

        // Returning the created text object.
        return text;
    }

    update() {
        // This method is called every frame.
        // Checking for space key press to start the respective scene.
        const cursors = this.input.keyboard.createCursorKeys();
        
        // Next scene
        if (cursors.space.isDown) {
            cursors.space.isDown = false;
            if (this.game == 'game') {
                this.scene.start('GameScene', {score: this.scoreVal});
            }
            else if (this.game == 'avoidance') {
                this.scene.start('AvoidanceScene', {score: this.scoreVal});
            }
        }
    }

    async saveData() {

        try {
            // Using setDoc to write data to the Firestore.
            await setDoc(this.cache.game.docRef, { trial_data: this.cache.game.data });
        } catch (err) {
            // Logging the error to console in case of a failure.
            console.error("Error writing document: ", err);
        }
    }
}

export default GameOver;
