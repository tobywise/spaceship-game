// Importing necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js';

// Your web app's Firebase configuration object
// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-auth-domain",
//   projectId: "your-project-id",
//   storageBucket: "your-storage-bucket",
//   messagingSenderId: "your-messaging-sender-id",
//   appId: "your-app-id",
// };

const firebaseConfig = {
    apiKey: "AIzaSyDf9ZvBdhn7vEV2ZVkUe5aFrCvJy1EvSac",
    authDomain: "onlinetesting-96dd3.firebaseapp.com",
    databaseURL: "https://onlinetesting-96dd3.firebaseio.com",
    projectId: "onlinetesting-96dd3",
    storageBucket: "onlinetesting-96dd3.appspot.com",
    messagingSenderId: "855612276612"
}

// Initialize Firebase with the config object
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// This variable will hold the unique identifier for the current user/session
let uid;

// Signs in the user anonymously and logs errors if any
signInAnonymously(auth).catch((error) => {
  console.error(error.code);
  console.error(error.message);
  document.body.innerHTML = `
    <div id="mainDiv">
      <div class="jspsych-display-element">
        <h1>Oops</h1>
        Looks like there's a problem! Try hard refreshing your browser (Ctrl + F5).
        <br><br>
        Thank you!
      </div>
    </div>`;
});

// Listening to the authentication state changes and assigning uid for authenticated users
onAuthStateChanged(auth, (user) => {
  if (user) uid = user.uid;
});


// Exporting uid, auth, and db so that they can be used in other files
export { uid, auth, db };



