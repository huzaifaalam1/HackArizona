const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config();

const serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "uarizona-rewards",
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Middleware to Verify Token
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data to request
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

// 🔹 Test route to check if the server is working
app.get("/", (req, res) => {
    res.send("UArizona Rewards API Running!");
});

// 🔹 Sign-Up API - Registers user in Firebase Authentication & Firestore
app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Check if user already exists in Firestore
        const snapshot = await db.collection("Students").where("email", "==", email).get();
        if (!snapshot.empty) {
            return res.status(400).json({ error: "User already exists in Firestore" });
        }

        // Create user in Firebase Authentication
        const userRecord = await getAuth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // Add user to Firestore with default points
        await db.collection("Students").doc(userRecord.uid).set({
            email: email.toLowerCase(),
            name: name,
            points: 100, // Default starting points
        });

        res.json({ message: "User registered successfully", uid: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Login API - Authenticates user and returns an ID Token
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Firebase Authentication does not provide direct password verification on the backend.
        // The frontend should handle login, and an ID token should be generated.
        return res.status(400).json({
            error: "Direct login not supported on backend. Use Firebase Authentication on the frontend to get an ID token.",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Get Student Points (Protected Route)
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
        snapshot.forEach((doc) => {
            console.log(`Found student: ${doc.id}`, doc.data());
            studentData = doc.data();
        });

        res.json({ points: studentData.points });
    } catch (error) {
        console.error("Firestore error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
