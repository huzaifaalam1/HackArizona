import React, { useState } from "react";
import "./SignUpPage.css";
import { useNavigate } from "react-router-dom";
import { signUp } from "../firebaseFunctions";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError(null);
    const success = await signUp(email, password, name);
    if (success) {
      navigate("/login");
    } else {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button onClick={handleSignup}>Sign Up</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SignupPage;
