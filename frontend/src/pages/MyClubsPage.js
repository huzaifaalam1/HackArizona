import React from "react";
import "./MyClubsPage.css";
import { Link } from "react-router-dom";

const sampleClubs = [
  {
    id: 1,
    name: "South Asian Student Association",
    role: "President",
    dateJoined: "January 20, 2024",
  },
  {
    id: 2,
    name: "Badminton Club",
    role: "Member",
    dateJoined: "March 5, 2024",
  },
];

const MyClubsPage = () => {
  return (
    <div className="clubs-page-container">
      <h2 className="clubs-heading">My Clubs</h2>
      <div className="clubs-list">
        {sampleClubs.map((club) => (
          <div className="club-card" key={club.id}>
            <h3 className="club-title">{club.name}</h3>
            <p className="club-role">👤 Role: {club.role}</p>
            <p className="club-date">📅 Joined: {club.dateJoined}</p>
            <div className="club-buttons">
              <button className="club-button">View Club Details</button>
              <Link to="/club-events">
                <button className="club-button">Upcoming Events</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClubsPage;
