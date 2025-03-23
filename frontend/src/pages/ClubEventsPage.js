import React, { useState } from "react";
import "./ClubEventsPage.css";
import { checkInForEvent } from "../firebaseFunctions";
import { Link } from "react-router-dom";

const ClubEventsPage = () => {
  const [message, setMessage] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    if (checkedIn) return; // prevent double-click

    const result = await checkInForEvent();
    if (result) {
      setMessage("✅ Check-In successful. Your points have been redeemed.");
      setCheckedIn(true);
    } else {
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  const events = [
    {
      id: 1,
      name: "Holi Celebration",
      date: "8:00am, March 23, 2025",
      location: "Student Union Grand Ballroom",
      description:
        "An explosion of colors, food, music, and springtime festivities.",
    },
  ];

  return (
    <div className="club-events-container">
      <h2 className="club-events-heading">South Asian Student Association - Upcoming Events</h2>

      {message && <p className="checkin-message">{message}</p>}

      <div className="event-cards">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <h3 className="event-name">{event.name}</h3>
            <p className="event-date">📅 Date: {event.date}</p>
            <p className="event-location">📍 Location: {event.location}</p>
            <p className="event-description">{event.description}</p>
            <button
              className="checkin-button"
              onClick={handleCheckIn}
              disabled={checkedIn}
            >
              {checkedIn ? "✅ Checked In" : "Check In"}
            </button>
          </div>
        ))}
      </div>

      <div className="back-button-container">
        <Link to="/dashboard">
          <button className="back-button">← Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default ClubEventsPage;
