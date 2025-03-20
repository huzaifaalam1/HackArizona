const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "uarizona-rewards"
    // databaseURL: "https://uarizona-rewards-default-rtdb.firebaseio.com/" 
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1]; // Extract token
    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data to request
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

// Test route to check if the server is working
app.get("/", (req, res) => {
    res.send("UArizona Rewards API Running!");
});

const db = admin.firestore(); // Initialize Firestore

// Get student points by email
app.get("/points/:email", verifyToken, async (req, res) => {
    const email = req.params.email.toLowerCase();
    console.log(`Searching for email: ${email}`);

    try {
        const snapshot = await db.collection("Students").where("email", "==", email).get();
        
        if (snapshot.empty) {
            console.log("No matching student found.");
            return res.status(404).json({ error: "Student not found" });
        }

        let studentData;
        snapshot.forEach(doc => {
            console.log(`Found student: ${doc.id}`, doc.data());
            studentData = doc.data();
        });

        res.json({ points: studentData.points });
    } catch (error) {
        console.error("Firestore error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
