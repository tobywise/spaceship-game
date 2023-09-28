// import './phaser.min.js';
import GameStart from './scenes/GameStart.js';
import GameScene from './scenes/GameScene.js';
import GameOver from './scenes/GameOver.js';
import EndScene from './scenes/EndScene.js';

// gameConfig.js
export default {
    type: Phaser.AUTO,
    parent: 'start',
    width: 800,
    height: 600,
    scene: [GameStart, new GameScene('GameScene'), new GameOver("GameOver"), EndScene]
};
