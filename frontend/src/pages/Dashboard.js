import React, { useEffect, useState } from "react";
import "./Dashboard.css";

// 🔹 Multiplier values mapped to badge
const badgeMultipliers = {
  Bronze: 1.0,
  Silver: 1.1,
  Gold: 1.25,
  Diamond: 1.3
};

const Dashboard = () => {
  const [name, setName] = useState("Parneet");
  const [points, setPoints] = useState(325);
  const [badge, setBadge] = useState("Bronze"); // default badge
  const [multiplier, setMultiplier] = useState(badgeMultipliers["Bronze"]);

  // 🔹 Update multiplier when badge changes
  useEffect(() => {
    const newMultiplier = badgeMultipliers[badge] || 1.0;
    setMultiplier(newMultiplier);
  }, [badge]);

  return (
    <div className="dashboard-container">
      {/* 1. Heading */}
      <h1 className="dashboard-heading">MyCampusRewards</h1>

      {/* 2. Navigation Bar */}
      <nav className="dashboard-nav">
        <a href="#account">Account Details</a>
        <a href="#clubs">My Clubs</a>
        <a href="#explore">Explore</a>
        <a href="#redeem">Redeem</a>
        <a href="#purchases">Purchases</a>
      </nav>

      <div className="dashboard-top-section">
        {/* 3. Student Info */}
        <div className="student-info">
          <h3>Hi, {name}!</h3>
          <p>Points: {points}</p>
        </div>

        {/* 4. Badge Display */}
        <div className="badge-display">
          <p>Badge: {badge}</p>
        </div>

        {/* 5. Multiplier */}
        <div className="multiplier">
          <p>Points Multiplier: {multiplier}x</p>
        </div>
      </div>

      <div className="dashboard-bottom-section">
        {/* 6. Leaderboard Preview */}
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          <ol>
            <li>Aryan - 500</li>
            <li>Parneet - 325</li>
            <li>Noel - 310</li>
            <li>Riya - 305</li>
            <li>Shaun - 300</li>
          </ol>
          <button>View More</button>
        </div>

        {/* 7. Milestones */}
        <div className="milestones">
          <h3>Milestones</h3>
          <ul>
            <li>🎯 100 Points: "Welcome Aboard" - Claimed</li>
            <li>🚀 300 Points: "Rising Star" - Claimed</li>
            <li>🏅 500 Points: "UArizona Achiever" - Upcoming</li>
          </ul>
        </div>
      </div>

      {/* 8. Recent Activity */}
      <div className="activity-log">
        <h3>Recent Activity</h3>
        <ul>
          <li>+25 points - Attended Club Workshop - Mar 21</li>
          <li>+50 points - Volunteered at Campus Event - Mar 20</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
