import React, { useState } from "react";
import { signUp, login, logout } from "./firebaseFunctions";

const App = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    const points = await login(email, password);
    if (points !== null) {
      setUserPoints(points);
    } else {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async () => {
    setError(null);
    const success = await signUp(email, password, name);
    if (success) {
      alert("Signup successful! You can now log in.");
    } else {
      setError("Signup failed. Try a different email or check the console.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserPoints(null);
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Welcome to UArizona Rewards</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={handleSignUp} style={{ marginRight: "10px" }}>
        Sign Up
      </button>
      <button onClick={handleLogin} style={{ marginRight: "10px" }}>
        Login
      </button>
      <button onClick={handleLogout}>Logout</button>

      {userPoints !== null && (
        <p style={{ marginTop: "20px" }}>🎉 Your Points: {userPoints}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "10px" }}>⚠️ {error}</p>}
    </div>
  );
};

export default App;