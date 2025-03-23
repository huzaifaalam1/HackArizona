import React, { useState, useEffect } from "react";
import "./RedeemPage.css";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../firebaseFunctions";
import { auth } from "../firebaseConfig"; // ✅ Required for token access

const offers = [
  {
    name: "UA Bookstore 10% Discount",
    points: 1200,
    description: "1 redemption per sem (valid on selected items)",
  },
  {
    name: "SUMC 10% Discount",
    points: 900,
    description: "2 redemptions per sem (order cap $20)",
  },
  {
    name: "AZ/Global/Highland Market 10% Discount",
    points: 800,
    description: "2 redemptions per sem (valid on selected products, order cap $15)",
  },
  {
    name: "SouthRec Court Reservation 10% off",
    points: 1200,
    description: "1 redemption per sem",
  },
];

const RedeemPage = () => {
  const [userData, setUserData] = useState({ name: "", points: 0 });
  const [availableOffers, setAvailableOffers] = useState([]);
  const [neededPoints, setNeededPoints] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserData();
        if (data && data.points !== undefined) {
          setUserData(data);
        } else {
          setUserData({ name: "", points: 0 });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const affordables = offers.filter((offer) => offer.points <= userData.points);
    setAvailableOffers(affordables);

    const closest = offers
      .filter((offer) => offer.points > userData.points)
      .sort((a, b) => a.points - b.points)[0];

    setNeededPoints(closest ? closest.points - userData.points : 0);
  }, [userData]);

  const redeemAward = async (award) => {
    const message = `Congratulations! You have redeemed the award: ${award.name}.
Terms: ${award.description}
Use coupon code: ${award.name.split(" ")[0]} at checkout.`;

    setModalMessage(message);
    setIsModalOpen(true);

    try {
      const updatedPoints = userData.points - award.points;

      // ✅ Secure token-based point update
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/updatePoints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points: updatedPoints }),
      });

      if (!response.ok) {
        throw new Error("Failed to update points");
      }

      const refreshed = await getUserData();
      setUserData(refreshed);
      setAvailableOffers((prev) => prev.filter((item) => item.name !== award.name));
    } catch (error) {
      console.error("Error redeeming:", error);
    }
  };

  return (
    <div className="redeem-container">
      <div className="redeem-header">
        <h1>Redeem Your Points</h1>
        <p>
          You're just one step away from amazing discounts and rewards. Check out what you can redeem with your points below!
        </p>
      </div>

      <div className="user-points">
        <h3>Your Current Points: {userData.points}</h3>
      </div>

      <div className="redeemable-offers">
        <h3>Rewards You Can Redeem With Your Current Points</h3>
        {availableOffers.length > 0 ? (
          availableOffers.map((award, index) => (
            <div key={index} className="award-card">
              <p>
                {award.name} - <strong>{award.points} Points</strong>
              </p>
              <p>{award.description}</p>
              <button className="redeem-now-btn" onClick={() => redeemAward(award)}>
                Redeem Now
              </button>
            </div>
          ))
        ) : (
          <p>
            Unfortunately, you don’t have enough points for any rewards right now.
            You need {neededPoints} more points to redeem the closest offer.
          </p>
        )}
      </div>

      <div className="available-discounts">
        <h3>Other Available Discounts</h3>
        <ul>
          {offers.map((offer, index) => (
            <li key={index}>
              <h4>{offer.name}</h4>
              <p>{offer.description}</p>
              <p>
                <strong>{offer.points} Points Required</strong>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate("/dashboard")} className="back-to-dashboard-btn">
        Back to Dashboard
      </button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h3>Redemption Successful!</h3>
            <p>{modalMessage}</p>
            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemPage;
