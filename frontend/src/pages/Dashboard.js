import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import {
  getUserData,
  getRecentActivity,
  getTopLeaderboard,
} from "../firebaseFunctions";
import { Link } from "react-router-dom";

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
  const [leaderboard, setLeaderboard] = useState([]);

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

      const top5 = await getTopLeaderboard();
      setLeaderboard(top5.slice(0, 5));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const newMultiplier = badgeMultipliers[badge] || 1.0;
    setMultiplier(newMultiplier);
  }, [badge]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">MyCampusRewards</h1>

      <nav className="dashboard-nav">
        <div className="nav-item dropdown">
          <span className="dropdown-button">Account</span>
          <div className="dropdown-content">
            <Link to="/personal-info">Personal Info</Link>
            <Link to="/reset-password">Reset Password</Link>
            <span
              className="dropdown-link"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Logout
            </span>
          </div>
        </div>

        <Link to="/my-clubs" className="nav-item">
          My Clubs
        </Link>

        <div className="nav-item dropdown">
          <span className="dropdown-button">Explore</span>
          <div className="dropdown-content">
            <Link to="/upcoming-events">Upcoming Events</Link>
            <Link to="/new-clubs">New Clubs</Link>
          </div>
        </div>

        <Link to="/redeem" className="nav-item">
          Redeem
        </Link>
        <Link to="/purchases" className="nav-item">
          Purchases
        </Link>
      </nav>

      <div className="dashboard-top-section">
        <div className="student-info">
          <h3>Hi, {name}!</h3>
          <p>Points: {points}</p>
        </div>

        <div className="badge-display">
          <p>Badge: {badge}</p>
        </div>

        <div className="multiplier">
          <p>Points Multiplier: {multiplier}x</p>
        </div>
      </div>

      <div className="dashboard-bottom-section">
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.length === 0 ? (
              <li>Loading...</li>
            ) : (
              leaderboard.map((user, index) => (
                <li key={index}>
                  {user.name} - {user.points} pts
                </li>
              ))
            )}
          </ol>
          <Link to="/leaderboard">
            <button>View More</button>
          </Link>
        </div>

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
