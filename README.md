# Spaceship game

This repository provides code for the spaceship game aversive learning task described in [Wise & Dolan (2020)](https://www.nature.com/articles/s41467-020-17977-w). The task aesthetics have been updated slightly compared to the original version, but it otherwise remains the same.

A demo of the task can be played [here](https://tw-spaceship-game.firebaseapp.com/).

> ⚠ Warning: This code is a refactored and tidied version of the code used in the original task. This rewriting process may have introduced bugs, and so it is recommended to check the performance of the task and the data it creates thoroughly. Any bugs can be reported in the [issues]() section of this repository.

## Using the task

The contents of this repository can be deployed using any web hosting service, and the task can be run in any modern web browser. The task is written in JavaScript, and does not require any server-side code. For my own usage, I have deployed it to [Google Firebase hosting](https://firebase.google.com/docs/hosting), but any hosting service should work.

### Task configuration

Task configuration variables are specified in the `src/config.js` file. These include variables to alter the speed of the asteroids, and the inter-trial interval.

There is also a variable that gives the completion URL, which can be used to provide e.g. a Prolific completion URL, or a link to questionnaires.

### Trial setup

The locations of the asteroids on each trial are specified in the `trial_info.json` file. This provides the same trial outcomes as the version used in the original paper, with 270 trials in total, but this can be edited if desired.

There are two variables in the JSON file, `positions_A` and `positions_B`, which refer to the positions of the two holes in the asteroid belts. If there is no hole, the value is set to `-999`.

## Saving data

### Google Firebase

The task is currently set up to save data to a [Google Firebase Firestore database](https://firebase.google.com/docs/firestore). To use this feature, you will need to create a Firebase project and add the project's credentials to the `firebaseConfig` variable in `src/firebaseSetup`: 

```javascript
// src/firebaseSetup.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};
```

You will also need to set up a project in the Firebase console. And then provide the reference to this in the `src/index.js` file:

```javascript
// src/index.js
const docRef = doc(db, 'spaceship', game.studyID, 'subjects', uid);
```

More information on how I typically use Firebase is available in (this blog post)[https://tobywise.com/posts/firebase-for-online-testing/].

### Other databases

Do you use a custom database, you will need to add in your own database code, replacing the Firebase code that is currently used. You can likely use a similar approach to that used for Firebase for any other database with a JavaScript API:

#### 1. Setup the database

The Firebase database is currently initialised in `src/firebaseSetup.js`. Equivalent code for your database will need to be added here. This can export relevant variables to be used in the main task code. For firebase, this looks like:

```javascript
// src/firebaseSetup.js
export { uid, auth, db };
```

Which are then imported in `src/index.js`:

```javascript
// src/index.js
import { uid, auth, db } from './firebaseSetup.js';
```

#### 2. Initialise the subject in the database

It's useful to create an entry for the subject before we start saving task data. This can also include relevant metadata (e.g., time, date). This is currently done in `src/index.js` for firebase, using the `db` and `uid` variables exported from `src/firebaseSetup.js`:

```javascript
// src/index.js
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
```

This can be replaced by equivalent code for other databases.

We also store references to the `docRef` and `db` variables so that these can be reused throughout the task in other code. Again, this practice could be followed for other databases:

```javascript
// src/index.js
game.docRef = docRef;
game.db = db;
```

#### 3. Save data to the database

The task stores data in the `this.cache.game.data` variable (there is technically a more correct way to do this, but this works fine). This is a standard JavaScript object, and so can be saved to the database in a similar way to how it is saved to Firebase.

Data is currently saved in two places: 

1. In the `gameOver.js` scene, which is reached whenever the subject loses all their health. This saves all of the data currently recorded to the database. For Firebase, this is implemented as follows:

```javascript
// src/scenes/gameOver.js
await setDoc(this.cache.game.docRef, { trial_data: this.cache.game.data });
```

2. In the `endScene.js` scene, which is reached when the task ends. This saves the data to the database. For Firebase, this is implemented as follows, and could again be replaced by equivalent code for other databases:

```javascript
// src/scenes/endScene.js
setDoc(this.cache.game.docRef, {
    trial_data: this.cache.game.data
}) 
```

Note that each time we save data we record the entirety of the data collected so far. This is not the most efficient way to do this, but it is the simplest and protects against errors in the data saving process.

#### Databases without JavaScript APIs

Alternatively, much of the above code can be substituted with HTTP requests to a server-side script. For example, the following code could be used to save data to a PHP script:

```javascript
// src/scenes/gameOver.js
const data = new FormData();
data.append('data', JSON.stringify(this.cache.game.data));
fetch('saveData.php', {
    method: 'POST',
    body: data
});
```