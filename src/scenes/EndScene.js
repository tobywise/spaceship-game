class EndScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'EndScene',
        });
    }

    init(data) {
        this.scoreVal = data.score;
        this.topScore = data.topScore;
    }

    async create() {
        // Calculate the time taken for the game
        const time_taken = (new Date() - this.cache.game.start_time) / 60000; // Converted to minutes

        // Prepare payload for API
        const payload = {
            id: this.cache.game.id,
            session: this.cache.game.session,
            task: this.cache.game.task || 'spaceship',
            write_mode: 'overwrite',
            data: Array.isArray(this.cache.game.data) ? this.cache.game.data : Object.values(this.cache.game.data)
        };
        try {
            const response = await fetch('http://localhost:5000/submit_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!result.success) {
                console.error('API error:', result.message);
            }
        } catch (err) {
            console.error('Error sending data to API:', err);
        }
        // Add the questionnaire to the page regardless of API result
        this.addText();
    }

    addText() {
        // Create text element with relevant styling and content
        this.text = this.make.text({
            style: {
                font: '20px Rubik',
                fill: 'white',
            },
            x: 400,
            y: 300,
            text: `End of the game!\n\n\n\nTop score: ${this.topScore}\n\n\nClick here to finish the task`, // Template literal for string interpolation
            origin: { x: 0.5, y: 0.5 }, // Setting origin using an object
            align: 'center',
        });

        // Set text as interactive and handle pointerup event
        this.text.setInteractive()
        .on('pointerup', () => {
            // Go to URL
            window.location.href = this.cache.game.completion_url;
        });
    }

    update() {
        // No updates are required in this method for now.
    }
}

export default EndScene;
