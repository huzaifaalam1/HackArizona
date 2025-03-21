import React, { useState } from "react";
import { signUp, login, logout } from "./firebaseFunctions"; // Import Firebase functions

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userPoints, setUserPoints] = useState(null);

  // Handle login
  const handleLogin = async () => {
    const points = await login(email, password);
    setUserPoints(points); // Store points for display
  };

  // Handle sign-up
  const handleSignUp = async () => {
    await signUp(email, password);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setUserPoints(null); // Clear points when user logs out
  };

  return (
    <div>
      <h1>Welcome to UArizona Rewards</h1>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>

      {userPoints !== null && <p>Your Points: {userPoints}</p>}
    </div>
  );
};

export default App;
