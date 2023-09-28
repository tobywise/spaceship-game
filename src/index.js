// Importing necessary modules and components

// Firebase modules and components - this may need to be changed if using a different database setup
import { uid, auth, db } from './firebaseSetup.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js';

// Task-specific modules and components
import config from './config.js';
import gameConfig from './gameConfig.js';
import { getQueryVariable } from './utils.js';


// Extract or generate subjectID, studyID, and testing variable based on the URL
const subjectID = window.location.search.includes('SUBJECT_ID') ? getQueryVariable('SUBJECT_ID') : Math.floor(Math.random() * 2000001);
const studyID = window.location.search.includes('STUDY') ? getQueryVariable('STUDY') : 'NONE';
// Testing variable limits the number of trials to 2, allowing the "full" task to be run quickly
const testing = window.location.search.includes('TEST') ? getQueryVariable('TEST') : 'FALSE';

// The startGame function initializes the game when the user decides to start it
const startGame = () => {
    // Clearing the start element and positioning the window to the top
    document.getElementById('start').innerHTML = "";
    window.scrollTo(0, 0);

    // Fetching trial information from the provided JSON file using fetch API
    fetch('./trial_info.json')
        .then(response => response.json())
        .then((data) => {

            // Creating and appending helper text to guide the user on how to play the game
            const helperText = document.createElement('div');
            helperText.innerHTML = 'Move the spaceship using the <b>up</b> and <b>down</b> keys to avoid the asteroids<br><br><br>';
            document.getElementById('start').appendChild(helperText);

            // Initializing the Phaser game with the configured settings
            const game = new Phaser.Game(gameConfig);

            // Assigning game properties and trial information to the game object
            Object.assign(game, {
                trial_info: data,
                trial: 0,
                player_trial: 0,
                data: {},
                dataKeys: ['health', 'hole1_y', 'hole2_y', 'player_y', 'score', 'subjectID', 'trial', 'trial_type'],
                subjectID,
                studyID,
                testing,
                iti: config.iti, // Accessing iti from config
                asteroid_velocity: config.asteroid_velocity, // Accessing asteroid_velocity from config
                asteroid_health_decrement: config.asteroid_health_decrement, // Accessing asteroid_health_decrement from config
                sampleRate: config.sampleRate, // Accessing sampleRate from config
                score_increment: config.score_increment, // Accessing score_increment from config
                health_increase: config.health_increase, // Accessing health_increase from config
                attention_check_key: config.attention_check_key, // Accessing attention_check_key from config
                attention_check_trials: config.attention_check_trials, // Accessing attention_check_trials from config
                completion_url: config.completion_url // Accessing completion_url from config
            });

            // Setting up initial data structure for the current game in Firestore
            const docRef = doc(db, 'spaceship', game.studyID, 'subjects', uid);
            setDoc(docRef, {
                subjectID: game.subjectID,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                trial_data: [],
                attention_checks: []
            }).catch(error => {
                console.error("Error writing to Firestore: ", error);
            });
            
            // Store database reference
            game.db = db;
            game.docRef = docRef;

            // Assigning other necessary properties to the game object
            game.uid = uid;
            game.start_time = new Date();
            game.attention_checks = [];
        })
        .catch((error) => {
            console.error('Error fetching the trial info JSON:', error);
        });
};

// Preparing and setting up the start page content and its functionality
document.getElementById('header_title').innerHTML = "Spaceship game";
document.getElementById('start').innerHTML = `
    <br>
    <b>This task includes attention checks. <br>When a warning appears on screen you will need to press the D key on your keyboard</b>
    <p>Click below to start</p>
    <button type="button" id="startButton" class="submit_button">Start Experiment</button>
    <br><br>`;

// Adding click event listener to the start button to initialize the game when clicked
document.getElementById("startButton").addEventListener('click', startGame);

