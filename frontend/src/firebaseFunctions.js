import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// 🔹 Sign-Up
export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password, name }),
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
      throw new Error(data.error || "Failed to fetch user data");
    }

    return {
      name: data.name,
      points: data.points,
      badge: data.badge
    };
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

export const getUserData = async () => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // stop listening once we get a result
        if (user) resolve(user);
        else reject(new Error("No user is currently logged in"));
      });
    });

    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/student`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching student data:", error);
    return null;
  }
};

export const getRecentActivity = async () => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("No user is currently logged in"));
      });
    });

    const token = await user.getIdToken();

    const response = await fetch(`${BACKEND_URL}/activity`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch activity log");
    }

    const data = await response.json();
    return data.activities;
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return [];
  }
};

export const getTopLeaderboard = async () => {
  try {
    const response = await fetch("http://localhost:5000/leaderboard");
    const data = await response.json();
    return data.leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const checkInForEvent = async () => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("No user logged in"));
      });
    });

    const token = await user.getIdToken();

    const response = await fetch("http://localhost:5000/check-in", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points: 50 }), // Customize point reward
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Check-in failed");
    }

    return data.message;
  } catch (error) {
    console.error("Check-in error:", error);
    return null;
  }
};

// Utility function to handle API calls
const fetchWithAuth = async (url, options = {}) => {
  try {
    const user = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) resolve(user);
        else reject(new Error("No user is currently logged in"));
      });
    });

    const token = await user.getIdToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${url}:`, error);
    throw error;
  }
};
// Get Heatmap Data
export const getHeatmapData = async (timeRange = "24h") => {
  try {
    console.log(`Fetching heatmap data for time range: ${timeRange}`);

    const data = await fetchWithAuth(
      `${BACKEND_URL}/api/heatmap?timeRange=${timeRange}`
    );

    console.log("Heatmap data received:", data);

    // Validate the structure of the returned data
    if (!data || !Array.isArray(data.heatmapData)) {
      console.warn("Unexpected heatmap data format", data);
      return {
        heatmapData: [],
        totalCheckIns: 0,
        topLocations: [],
      };
    }

    return data;
  } catch (error) {
    console.error("Comprehensive error fetching heatmap data:", error);
    return {
      heatmapData: [],
      totalCheckIns: 0,
      topLocations: [],
    };
  }
};
// 🔹 Record Check-in
export const recordCheckIn = async (locationData) => {
  try {
    return await fetchWithAuth(`${BACKEND_URL}/api/checkin`, {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  } catch (error) {
    console.error("Error recording check-in:", error);
    return null;
  }
};
