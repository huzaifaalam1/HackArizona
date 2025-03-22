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
    const token = req.headers.authorization?.split("Bearer ")[1];

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

// 🔹 Test Route
app.get("/", (req, res) => {
    res.send("UArizona Rewards API Running!");
});

// 🔹 Sign-Up API - Registers user in Firebase Authentication & Firestore
app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // 🔥 Step 1: Check if user exists in Firebase Authentication
        let userRecord;
        try {
            userRecord = await getAuth().getUserByEmail(email);
        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                return res.status(500).json({ error: "Error checking Firebase Auth" });
            }
        }

        // 🔥 Step 2: Create user in Firebase Authentication if not found
        if (!userRecord) {
            userRecord = await getAuth().createUser({
                email: email,
                password: password,
                displayName: name,
            });
        }

        // 🔥 Step 3: Check if user exists in Firestore
        const studentRef = db.collection("Students").doc(userRecord.uid);
        const studentDoc = await studentRef.get();

        if (!studentDoc.exists) {
            // 🔥 Step 4: Add user to Firestore
            await studentRef.set({
                email: email.toLowerCase(),
                name: name,
                points: 100,
            });
        }

        res.status(201).json({ message: "User registered successfully", uid: userRecord.uid });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Login API - Verifies ID Token Sent from Frontend
app.post("/login", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        // 🔥 Step 1: Fetch user from Firestore
        const studentRef = db.collection("Students").doc(userId);
        const studentDoc = await studentRef.get();

        if (!studentDoc.exists) {
            return res.status(404).json({ error: "User not found in Firestore" });
        }

        const studentData = studentDoc.data();
        res.json({ message: "Login successful", points: studentData.points });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Get Student Points (Protected Route)
app.get("/points/:email", verifyToken, async (req, res) => {
    const email = req.params.email.trim().toLowerCase(); // 🔥 Normalize email
    console.log(`Searching for email: ${email}`);

    try {
        const snapshot = await db.collection("Students").where("email", "==", email).get();

        if (snapshot.empty) {
            console.log("No matching student found.");
            // 🔥 Optional: log existing emails to compare
            const allDocs = await db.collection("Students").get();
            allDocs.forEach((doc) => {
                console.log("Existing email in DB:", doc.data().email);
            });

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

// 🔹 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});