import React, { useState, useEffect } from "react";
import "./LeaderboardPage.css";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"; // Chart library for league distribution
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

// Define the leagues with min/max points for each league
const leagues = [
  { name: "Unranked", minPoints: 0, maxPoints: 50 },
  { name: "Wildcat Cubs", minPoints: 51, maxPoints: 150 },
  { name: "Campus Climber", minPoints: 151, maxPoints: 300 },
  { name: "McKale Minions", minPoints: 301, maxPoints: 600 },
  { name: "Social Scholar", minPoints: 601, maxPoints: 1000 },
  { name: "Wildcat Warlord", minPoints: 1001, maxPoints: 1500 },
  { name: "Master of the Mall", minPoints: 1501, maxPoints: Infinity },
];

// Function to calculate the league based on points
const getUserLeague = (points) => {
  return leagues.find(
    (league) => points >= league.minPoints && points <= league.maxPoints
  ).name;
};

// Function to calculate the rank dynamically
const getRank = (points, leaderboard) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  const rankIndex = sortedLeaderboard.findIndex((user) => user.points === points);
  return rankIndex + 1;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [fullLeaderboard, setFullLeaderboard] = useState({});
  const [userData, setUserData] = useState({
    name: "",
    points: 0,
    badge: "",
  });
  const [isFullLeaderboardVisible, setIsFullLeaderboardVisible] = useState(false);

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/leaderboard");
        const data = await response.json();
        setLeaderboard(data.leaderboard);

        const currentUser = data.leaderboard.find(user => user.name === "User Test");
        if (currentUser) {
          setUserData(currentUser);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  // Organize the leaderboard data by leagues
  const fullLeaderboardData = {
    Unranked: leaderboard.filter((user) => user.points <= 50),
    "Wildcat Cubs": leaderboard.filter((user) => user.points > 50 && user.points <= 150),
    "Campus Climber": leaderboard.filter((user) => user.points > 150 && user.points <= 300),
    "McKale Minions": leaderboard.filter((user) => user.points > 300 && user.points <= 600),
    "Social Scholar": leaderboard.filter((user) => user.points > 600 && user.points <= 1000),
    "Wildcat Warlord": leaderboard.filter((user) => user.points > 1000 && user.points <= 1500),
    "Master of the Mall": leaderboard.filter((user) => user.points > 1500),
  };

  const fetchFullLeaderboard = () => {
    setFullLeaderboard(fullLeaderboardData);
    setIsFullLeaderboardVisible(true);
  };

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-heading">Leaderboard</h1>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
              <th>League</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 10).map((user) => (
              <tr key={user.id}>
                <td>{getRank(user.points, leaderboard)}</td>
                <td>{user.name}</td>
                <td>{user.points}</td>
                <td>{getUserLeague(user.points)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }} >
                ...
              </td>
            </tr>
            {/* Show the current user's rank */}
            <tr>
              <td>{getRank(userData.points, leaderboard)}</td>
              <td>{userData.name}</td>
              <td>{userData.points}</td>
              <td>{getUserLeague(userData.points)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button onClick={fetchFullLeaderboard} className="view-full-rankings-btn">
        View Full Rankings
      </button>

      {/* Show full leaderboard data */}
      {isFullLeaderboardVisible && (
        <div className="full-leaderboard">
          <h2>Full Leaderboard</h2>
          <h3>Displaying the top 100 users in each league</h3>

          {/* Render leagues in reverse order */}
          {Object.keys(fullLeaderboard).reverse().map((league) => (
            <div key={league} className="league-section">
              <h3>{league} League</h3>
              {fullLeaderboard[league].length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Overall Rank</th>
                      <th>Rank in League</th>
                      <th>Name</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullLeaderboard[league].map((user, index) => (
                      <tr key={index}>
                        <td>{getRank(user.points, leaderboard)}</td>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No one in this League!</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Return to Home button */}
      <button onClick={() => navigate("/dashboard")} className="view-full-rankings-btn return-home-btn">
      Return to Dashboard
      </button>


    </div>
  );
};

export default LeaderboardPage;