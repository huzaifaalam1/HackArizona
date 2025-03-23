import React from "react";
import "./UpcomingEventsPage.css";

const sampleEvents = [
  {
    id: 1,
    name: "UArizona Startup Fair",
    date: "April 12, 2025",
    registered: 57,
  },
  {
    id: 2,
    name: "Women in STEM Panel",
    date: "April 19, 2025",
    registered: 112,
  },
  {
    id: 3,
    name: "Data Science Hackathon",
    date: "May 3, 2025",
    registered: 89,
  },
];

const UpcomingEventsPage = () => {
  return (
    <div className="events-page-container">
      <h2 className="events-heading">Upcoming Events</h2>
      <div className="events-list">
        {sampleEvents.map((event) => (
          <div className="event-card" key={event.id}>
            <h3 className="event-title">{event.name}</h3>
            <p className="event-date">📅 Date: {event.date}</p>
            <p className="event-registered">
              👥 Registered: {event.registered}
            </p>
            <button className="register-button">Register Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEventsPage;
