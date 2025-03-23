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
        // ✅ Email Domain Check (Backend Validation)
        if (!email.toLowerCase().endsWith("@arizona.edu")) {
            return res.status(400).json({ error: "Only @arizona.edu emails are allowed." });
        }

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
            // 🔥 Step 4: Add user to Firestore with default badge
            await studentRef.set({
                email: email.toLowerCase(),
                name: name,
                points: 100,
                badge: "Bronze"
            });
        } else {
            // ✅ Ensure badge is set for older users
            const data = studentDoc.data();
            if (!data.badge) {
                await studentRef.update({ badge: "Bronze" });
            }
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
    const email = req.params.email.trim().toLowerCase();
    console.log(`Searching for email: ${email}`);

    try {
        const snapshot = await db.collection("Students").where("email", "==", email).get();

        if (snapshot.empty) {
            console.log("No matching student found.");
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

        res.json({ 
            points: studentData.points,
            name: studentData.name,
            badge: studentData.badge || "Bronze"
        });
    } catch (error) {
        console.error("Firestore error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Get Full Student Data by Firebase Auth Email
app.get("/student", verifyToken, async (req, res) => {
    try {
      const userEmail = req.user.email.toLowerCase(); // 🔥 Get email from decoded token
  
      const snapshot = await db.collection("Students").where("email", "==", userEmail).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      const studentData = snapshot.docs[0].data();
      res.json(studentData); // { name, points, badge }
    } catch (error) {
      console.error("Error fetching student data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });  
  
// 🔹 Get Recent Activity (Protected Route)
app.get("/activity", verifyToken, async (req, res) => {
    try {
      const userEmail = req.user.email.toLowerCase();
  
      // Step 1: Find the student document by email
      const snapshot = await db.collection("Students").where("email", "==", userEmail).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      const studentDoc = snapshot.docs[0];
      const activityRef = studentDoc.ref.collection("ActivityLog");
  
      // Step 2: Fetch activities (sorted by timestamp descending)
      const activitySnap = await activityRef.orderBy("timestamp", "desc").limit(5).get();
      console.log("Fetched activity documents count:", activitySnap.docs.length);
  
      const activities = activitySnap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp.toDate().toISOString(), // 🔥 convert to ISO string
        };
      });
      
  
      res.json({ activities });
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });  

// 🔹 Get Leaderboard - Top 10 Users
app.get("/leaderboard", async (req, res) => {
    try {
        // 🔥 Fetch all students and order them by points in descending order
        const snapshot = await db.collection("Students").orderBy("points", "desc").limit(10).get();
        
        if (snapshot.empty) {
            return res.status(404).json({ error: "No users found" });
        }

        let leaderboard = [];
        snapshot.forEach((doc, index) => {
            const user = doc.data();
            leaderboard.push({
                rank: index + 1,
                name: user.name,
                points: user.points,
                badge: user.badge || "Bronze", // Default to Bronze if no badge
                email: user.email
            });
        });

        res.json({ leaderboard });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Get Full Leaderboard by League - Top 100 Users per League
app.get("/leaderboard/full", async (req, res) => {
    try {
        const leagues = ["Bronze", "Silver", "Gold", "Diamond"];
        let fullLeaderboard = {};

        for (let league of leagues) {
            // 🔥 Get the top 100 users in each league
            const snapshot = await db.collection("Students")
                .where("badge", "==", league)
                .orderBy("points", "desc")
                .limit(100)
                .get();

            if (snapshot.empty) {
                fullLeaderboard[league] = [];
                continue;
            }

            let leaderboard = [];
            snapshot.forEach((doc, index) => {
                const user = doc.data();
                leaderboard.push({
                    rank: index + 1,
                    name: user.name,
                    points: user.points,
                    badge: user.badge || "Bronze",
                    email: user.email
                });
            });
            fullLeaderboard[league] = leaderboard;
        }

        res.json(fullLeaderboard);
    } catch (error) {
        console.error("Full leaderboard error:", error);
        res.status(500).json({ error: error.message})
    }
});

// 🔹 POST /check-in - Adds points to current user (e.g. 50 pts)
app.post("/check-in", verifyToken, async (req, res) => {
    const pointsToAdd = req.body.points || 50; // default to 50
    const userEmail = req.user.email.toLowerCase();
  
    try {
      const snapshot = await db.collection("Students").where("email", "==", userEmail).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const doc = snapshot.docs[0];
      const currentPoints = doc.data().points || 0;
      await doc.ref.update({ points: currentPoints + pointsToAdd });
  
      res.json({ message: "Points updated successfully" });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  app.get("/userData", verifyToken, async (req, res) => {
    try {
      const userId = req.user.uid; // Get the current logged-in user's ID from the decoded token
  
      // Fetch user data from Firestore using the userId
      const studentRef = db.collection("Students").doc(userId);
      const studentDoc = await studentRef.get();
  
      if (!studentDoc.exists) {
        return res.status(404).send("User not found");
      }
  
      // Return the real user data from Firestore
      const userData = studentDoc.data();
      res.json({
        id: userId,
        name: userData.name,
        points: userData.points
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 🔒 Secure version using verifyToken middleware
app.post('/updatePoints', verifyToken, async (req, res) => {
    const { points } = req.body;
    const userEmail = req.user.email.toLowerCase();
  
    try {
      const snapshot = await db.collection("Students").where("email", "==", userEmail).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const studentRef = snapshot.docs[0].ref;
      await studentRef.update({ points });
  
      res.status(200).json({ message: 'Points updated successfully' });
    } catch (error) {
      console.error("Error updating points:", error);
      res.status(500).json({ error: 'Error updating points' });
    }
  });
  

// 🔹 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
