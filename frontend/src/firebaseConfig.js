import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"; // Only the necessary imports

const firebaseConfig = {
    apiKey: "AIzaSyD98vwhXfuTEUxRUB4SI8QRLEGIIYGkXz8",
    authDomain: "uarizona-rewards.firebaseapp.com",
    //databaseURL: "https://uarizona-rewards-default-rtdb.firebaseio.com",
    projectId: "uarizona-rewards",
    storageBucket: "uarizona-rewards.firebasestorage.app",
    messagingSenderId: "390819291935",
    appId: "1:390819291935:web:2935f3d39b23df4b9b462a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication

export { auth };
