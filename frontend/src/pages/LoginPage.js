import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { login } from "../firebaseFunctions";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    const points = await login(email, password);
    if (points !== null) {
      navigate("/dashboard");
    } else {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back!</h2>
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
      <button onClick={handleLogin}>Log In</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LoginPage;
