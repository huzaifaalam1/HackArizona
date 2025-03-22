import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { auth } from "./firebaseConfig";

const BACKEND_URL = "http://localhost:5000";

// 🔹 Sign-Up
export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      throw new Error("Backend signup failed");
    }

    return true;
  } catch (error) {
    console.error("Error during sign-up:", error);
    return false;
  }
};

// 🔹 Login
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/points/${email}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user points");
    }

    return data.points;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
};

// 🔹 Logout
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};