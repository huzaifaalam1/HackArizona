import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { getUserData, getRecentActivity, logout } from "../firebaseFunctions";
import { Link } from "react-router-dom";


// 🔹 Multiplier values mapped to badge
const badgeMultipliers = {
  Bronze: 1.0,
  Silver: 1.1,
  Gold: 1.25,
  Diamond: 1.3,
};

const Dashboard = () => {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [badge, setBadge] = useState("Bronze");
  const [multiplier, setMultiplier] = useState(badgeMultipliers["Bronze"]);
  const [activityLog, setActivityLog] = useState([]);

  // 🔹 Fetch student info on page load
  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData();
      if (userData) {
        setName(userData.name);
        setPoints(userData.points);
        setBadge(userData.badge || "Bronze");
      }

      const log = await getRecentActivity();
      setActivityLog(log);
    };
    fetchData();
  }, []);

  // 🔹 Update multiplier whenever badge changes
  useEffect(() => {
    const newMultiplier = badgeMultipliers[badge] || 1.0;
    setMultiplier(newMultiplier);
  }, [badge]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login"; // 🔁 Redirect to login page after logout
  };

  return (
    <div className="dashboard-container">
      {/* 1. Heading */}
      <h1 className="dashboard-heading">MyCampusRewards</h1>

      {/* 2. Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-item dropdown">
          <span className="dropdown-button">Account</span>
          <div className="dropdown-content">
            <a href="#personal-info">Personal Info</a>
            <a href="#reset-password">Reset Password</a>
            <a href="#logout">Logout</a>
          </div>
        </div>
        <a href="#clubs" className="nav-item">
          My Clubs
        </a>
        <a href="#explore" className="nav-item">
          Explore
        </a>
        <a href="#redeem" className="nav-item">
          Redeem
        </a>
        <a href="#purchases" className="nav-item">
          Purchases
        </a>
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
          <Link to="/leaderboard">
            <button>View More</button>
          </Link>
        </div>

        {/* 7. Milestones */}
        <div className="milestones">
          <h3>Milestones</h3>
          <ul>
            <li>
              🎯 100 Points: "Welcome Aboard" -{" "}
              {points >= 100 ? "Claimed" : "Upcoming"}
            </li>
            <li>
              🚀 300 Points: "Rising Star" -{" "}
              {points >= 300 ? "Claimed" : "Upcoming"}
            </li>
            <li>
              🏅 500 Points: "UArizona Achiever" -{" "}
              {points >= 500 ? "Claimed" : "Upcoming"}
            </li>
          </ul>
        </div>
      </div>

      {/* 8. Recent Activity */}
      <div className="activity-log">
        <h3>Recent Activity</h3>
        <ul>
          {activityLog.length === 0 ? (
            <li>No recent activity.</li>
          ) : (
            activityLog.map((item, index) => (
              <li key={index}>
                +{item.points} points - {item.description} -{" "}
                {new Date(item.timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
