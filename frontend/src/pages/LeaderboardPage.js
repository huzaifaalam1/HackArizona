import React, { useState, useEffect } from "react";
import "./LeaderboardPage.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

// League tiers
const leagues = [
  { name: "Unranked", minPoints: 0, maxPoints: 50 },
  { name: "Wildcat Cubs", minPoints: 51, maxPoints: 150 },
  { name: "Campus Climber", minPoints: 151, maxPoints: 300 },
  { name: "McKale Minions", minPoints: 301, maxPoints: 600 },
  { name: "Social Scholar", minPoints: 601, maxPoints: 1000 },
  { name: "Wildcat Warlord", minPoints: 1001, maxPoints: 1500 },
  { name: "Master of the Mall", minPoints: 1501, maxPoints: Infinity },
];

const getUserLeague = (points) => {
  return leagues.find(
    (league) => points >= league.minPoints && points <= league.maxPoints
  ).name;
};

const getRank = (points, leaderboard) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  const rankIndex = sortedLeaderboard.findIndex((user) => user.points === points);
  return rankIndex + 1;
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [fullLeaderboard, setFullLeaderboard] = useState({});
  const [userData, setUserData] = useState(null);
  const [isFullLeaderboardVisible, setIsFullLeaderboardVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/leaderboard");
        const data = await response.json();
        setLeaderboard(data.leaderboard);

        const user = auth.currentUser;

        if (user && user.email) {
          const matchedUser = data.leaderboard.find(
            (entry) => entry.email === user.email
          );

          if (matchedUser) {
            setUserData(matchedUser);
          } else {
            // fallback: user is not in top 10
            // optionally fetch full data from backend OR show zero data
            setUserData({
              name: user.displayName || "You",
              email: user.email,
              points: 0,
              badge: "Bronze"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

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
            {leaderboard.slice(0, 10).map((user, index) => (
              <tr key={index}>
                <td>{getRank(user.points, leaderboard)}</td>
                <td>{user.name}</td>
                <td>{user.points}</td>
                <td>{getUserLeague(user.points)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                ...
              </td>
            </tr>
            {userData && (
              <tr>
                <td>{getRank(userData.points, leaderboard)}</td>
                <td>{userData.name}</td>
                <td>{userData.points}</td>
                <td>{getUserLeague(userData.points)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={fetchFullLeaderboard} className="view-full-rankings-btn">
        View Full Rankings
      </button>

      {isFullLeaderboardVisible && (
        <div className="full-leaderboard">
          <h2>Full Leaderboard</h2>
          <h3>Displaying the top 100 users in each league</h3>

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

      <button
        onClick={() => navigate("/dashboard")}
        className="view-full-rankings-btn return-home-btn"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default LeaderboardPage;
