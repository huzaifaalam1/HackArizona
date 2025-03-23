require("dotenv").config();
console.log("Debug - AWS credentials check:");
console.log("AWS_REGION:", process.env.AWS_REGION ? "Found" : "Not found");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "Found" : "Not found");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Found" : "Not found");
console.log("AWS_SESSION_TOKEN:", process.env.AWS_SESSION_TOKEN ? "Found" : "Not found");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { getAuth } = require("firebase-admin/auth");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

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
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// 🔹 Check-in Endpoint with Heatmap Support
app.post("/api/checkin", verifyToken, async (req, res) => {
  try {
    const { locationId, locationName, latitude, longitude } = req.body;
    const userId = req.user.uid;

    if (!locationId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields: locationId, latitude, longitude' });
    }

    const checkInRef = db.collection('CheckIns').doc();
    await checkInRef.set({
      userId,
      locationId,
      locationName: locationName || locationId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      points: 10
    });

    const userRef = db.collection('Students').doc(userId);
    await userRef.update({ points: admin.firestore.FieldValue.increment(10) });

    res.json({ message: 'Check-in recorded successfully', points: 10 });
  } catch (error) {
    console.error('Check-in Error:', error);
    res.status(500).json({ error: 'Could not record check-in' });
  }
});

// 🔹 Heatmap Data Endpoint
app.get("/api/heatmap", verifyToken, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    const calculateStartTime = (range) => {
      const now = new Date();
      switch (range) {
        case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
        case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
        case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '6d': return new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        case '1m': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    };

    const startTime = calculateStartTime(timeRange);

    const checkInsRef = db.collection('CheckIns');
    const snapshot = await checkInsRef.where('timestamp', '>=', startTime).get();

    const heatmapData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        lat: data.latitude,
        lng: data.longitude,
        weight: data.points || 1,
        locationName: data.locationName || 'Unknown Location'
      };
    });

    const locationCounts = heatmapData.reduce((acc, point) => {
      acc[point.locationName] = (acc[point.locationName] || 0) + 1;
      return acc;
    }, {});

    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      heatmapData,
      timeRange,
      totalCheckIns: heatmapData.length,
      topLocations
    });
  } catch (error) {
    console.error('Heatmap Data Error:', error);
    res.status(500).json({ error: 'Could not retrieve heatmap data' });
  }
});

// 🔹 AWS Bedrock AI Chatbot Endpoint
app.post("/api/bedrock", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Initialize the Bedrock client with explicit credentials
    const client = new BedrockRuntimeClient({
      region: "us-west-2", // Hardcode to us-east-1 to match your AWS console
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN, // Include session token
      },
    });
    
    console.log("AWS Bedrock client initialized with region: us-east-1");
    console.log("AWS credentials loaded:", 
              process.env.AWS_ACCESS_KEY_ID ? "Access Key Present" : "Access Key Missing", 
              process.env.AWS_SECRET_ACCESS_KEY ? "Secret Key Present" : "Secret Key Missing",
              process.env.AWS_SESSION_TOKEN ? "Session Token Present" : "Session Token Missing");
    
    console.log("Sending prompt to AWS Bedrock...");
    
    // Prepare the payload for Titan model
    const payload = {
      inputText: prompt,
      textGenerationConfig: {
        temperature: 0.7,
        maxTokenCount: 512,
        stopSequences: []
      }
    };
    
    // Create the command
    const command = new InvokeModelCommand({
      modelId: "amazon.titan-text-express-v1", // Using Express model
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json",
    });
    
    // Send request to AWS Bedrock
    const response = await client.send(command);
    
    console.log("Received response from AWS Bedrock");
    
    // Use Buffer instead of TextDecoder for better cross-platform compatibility
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf8'));
    
    // Return the AI response to the frontend
    res.json({ text: responseBody.results[0].outputText });
  } catch (error) {
    console.error("Bedrock error:", error);
    
    // Fallback for hackathon demo if AWS Bedrock fails
    console.log("Using fallback AI response generator");
    
    const { prompt } = req.body;
    const simulatedResponse = simulateBotResponse(prompt);
    res.json({ text: simulatedResponse });
  }
});

// Fallback response function with comprehensive responses
const simulateBotResponse = (userInput) => {
  console.log("Using fallback response system for:", userInput);
  // Convert input to lowercase for easier matching
  const input = userInput.toLowerCase();
  
  // Simple response dictionary for demo purposes
  if (input.includes('point') && (input.includes('earn') || input.includes('get'))) {
    return "You can earn points in multiple ways on campus! Each check-in gives you 10 points, attending campus events can earn 20-50 points depending on the event type, and completing weekly challenges can earn 30-100 points. The most efficient strategy is to establish a daily check-in routine at different campus locations while prioritizing special events that offer bonus points.";
  } 
  else if (input.includes('redeem') || input.includes('spend') || input.includes('use point')) {
    return "In the Rewards Shop, you can redeem your points for various items: campus store discounts (250 points for 10% off), event tickets (300-500 points), exclusive experiences like behind-the-scenes tours (600 points), and limited edition University merchandise (750-1000 points). The best value is typically the exclusive experiences, which often cost more if purchased directly.";
  }
  else if (input.includes('check in') || input.includes('checking in')) {
    return "The check-in process is designed to be simple! Just tap the 'Check In Now' button on your dashboard when you're physically at a campus location. Your device's GPS will verify your location, and the system will award points based on where you are. Some locations like the library or student union have bonus points during special hours. Make sure location services are enabled for the best experience.";
  }
  else if (input.includes('badge') || input.includes('level')) {
    return "The badge system rewards consistent engagement with campus activities. Starting at Bronze (0-300 points), you'll progress to Silver (301-750 points), then Gold (751-1500 points), and finally Diamond (1500+ points). Each level increases your point multiplier and unlocks exclusive rewards. Diamond members get first access to special events and limited-edition university merchandise not available to other levels.";
  }
  else if (input.includes('multiplier')) {
    return "The points multiplier is one of the most valuable features of higher badge levels! Bronze members earn the base rate (1.0x), Silver members get a 10% bonus (1.1x), Gold members enjoy a 25% boost (1.25x), and Diamond members receive a generous 30% bonus (1.3x) on all activities. This means a standard 10-point check-in would earn 13 points for a Diamond member - these multipliers really add up over time!";
  }
  else if (input.includes('strategy') || input.includes('tip') || input.includes('advice')) {
    return "For maximizing your rewards, I recommend: 1) Check in daily at different locations (variety gives you more points), 2) Prioritize special events marked with a star icon for bonus points, 3) Complete the weekly challenges which often give high point values for simple tasks, 4) Reach Silver badge as quickly as possible to start earning the point multiplier, and 5) Use your points strategically - saving for larger rewards usually gives better value than small redemptions.";
  }
  else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return "Hello there! I'm your University of Arizona Rewards assistant. I can help you understand how to earn points, redeem rewards, check in at campus locations, and make the most of your student experience. What would you like to know about today?";
  }
  else {
    return "As your University of Arizona Rewards assistant, I'm here to help you make the most of the campus rewards program. The program is designed to encourage student engagement across campus by offering points for check-ins at various locations, attending events, and participating in campus activities. You can redeem these points for discounts, event tickets, exclusive experiences, and UA merchandise. What specific aspect of the rewards program would you like to learn more about?";
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
    console.log('Searching for email: ${email}');

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
            console.log('Found student: ${doc.id}', doc.data());
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
    console.log('Server running on port ${PORT}');
    console.log('Heatmap endpoint available at: /api/heatmap');
    console.log('Bedrock AI endpoint available at: /api/bedrock');
});