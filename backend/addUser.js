const admin = require("firebase-admin");

const serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function createUser() {
    try {
        const user = await admin.auth().createUser({
            email: "testuser@email.com",
            emailVerified: true,
            password: "Test1234!",
            displayName: "Test User"
        });
        console.log("User created successfully:", user);
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

createUser();
