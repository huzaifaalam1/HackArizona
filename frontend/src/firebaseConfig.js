import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD98vwhXfuTEUxRUB4SI8QRLEGIIYGkXz8",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "uarizona-rewards.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "uarizona-rewards",
    storageBucket: "uarizona-rewards.appspot.com",
    messagingSenderId: "390819291935",
    appId: "1:390819291935:web:2935f3d39b23df4b9b462a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { firebaseConfig, auth, db };