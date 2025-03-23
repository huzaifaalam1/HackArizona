import React, { useState } from "react";
import "./ResetPasswordPage.css";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-heading">Reset Your Password</h2>
      <form onSubmit={handleReset} className="info-box">
        <label>
          Enter your email:
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </label>
        <button type="submit" className="submit-btn">Send Reset Link</button>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </form>
    </div>
  );
};

export default ResetPasswordPage;
