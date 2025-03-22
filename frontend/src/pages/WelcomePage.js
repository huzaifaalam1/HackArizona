import React from "react";
import { Link } from "react-router-dom";
import "./WelcomePage.css";

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to My Campus Rewards</h1>
      <p>Earn points. Get rewarded. Stay involved.</p>
      <div className="button-group">
        <Link to="/signup" className="button">Sign Up</Link>
        <Link to="/login" className="button">Login</Link>
      </div>
    </div>
  );
};

export default WelcomePage;
