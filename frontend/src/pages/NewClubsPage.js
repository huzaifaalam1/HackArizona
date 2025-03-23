import React from "react";
import "./NewClubsPage.css";

const sampleClubs = [
  {
    id: 1,
    name: "Women in Finanace",
    weeksOpen: 2,
    members: 40,
  },
  {
    id: 3,
    name: "HackPath",
    weeksOpen: 1,
    members: 17,
  },
];

const NewClubsPage = () => {
  return (
    <div className="clubs-page-container">
      <h2 className="clubs-heading">New Clubs</h2>
      <div className="clubs-list">
        {sampleClubs.map((club) => (
          <div className="club-card" key={club.id}>
            <h3 className="club-title">{club.name}</h3>
            <p className="club-weeks">🕒 Opened: {club.weeksOpen} weeks ago</p>
            <p className="club-members">👥 Members: {club.members}</p>
            <button className="contact-button">Contact Club</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewClubsPage;
