const fetch = require("node-fetch");

// 🔥 Replace with your Firebase API Key (found in Firebase Console → Project Settings)
const API_KEY = "AIzaSyD98vwhXfuTEUxRUB4SI8QRLEGIIYGkXz8";
const EMAIL = "huzaifaalam61@gmail.com";
const PASSWORD = "Huzi12";

async function getIdToken() {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: EMAIL,
            password: PASSWORD,
            returnSecureToken: true
        })
    });

    const data = await response.json();
    if (data.idToken) {
        console.log("Your ID Token:", data.idToken);

        // 🔥 Automatically test your API
        fetch(`http://localhost:5000/points/${EMAIL}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${data.idToken}`
            }
        })
        .then(response => response.json())
        .then(data => console.log("API Response:", data))
        .catch(error => console.error("API Error:", error));
    } else {
        console.error("Error getting token:", data);
    }
}

getIdToken();
