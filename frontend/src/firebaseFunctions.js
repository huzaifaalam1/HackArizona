import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Import the auth instance from firebaseConfig

// Sign-Up function
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    // Send the token to your backend API for processing
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Send token for verification
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: user.displayName // You can add displayName if needed
      })
    });
    console.log('User signed up and data sent to backend:', response);
  } catch (error) {
    console.error("Error during sign-up:", error);
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Fetch user points using token
    const response = await fetch(`/points/${email}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}` // Send token for verification
      }
    });

    const data = await response.json();
    console.log("User points:", data);
    return data.points; // You can set this to the state later
  } catch (error) {
    console.error("Error during login:", error);
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
