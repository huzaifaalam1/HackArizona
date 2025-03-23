import React from "react";
import "./PurchasesPage.css";

const badgePlans = [
  {
    id: 1,
    tier: "Silver",
    multiplier: "1.1x",
    price: "$5/semester",
  },
  {
    id: 2,
    tier: "Gold",
    multiplier: "1.25x",
    price: "$10/semester",
  },
  {
    id: 3,
    tier: "Diamond",
    multiplier: "1.3x",
    price: "$20/semester",
  },
];

const PurchasesPage = () => {
  return (
    <div className="purchase-page-container">
      <h2 className="purchase-heading">Purchase a Badge</h2>
      <div className="purchase-list">
        {badgePlans.map((plan) => (
          <div className="purchase-card" key={plan.id}>
            <h3 className="badge-title">Badge: {plan.tier}</h3>
            <p className="badge-multiplier">💎 Multiplier: {plan.multiplier}</p>
            <p className="badge-price">💰 Price: {plan.price}</p>
            <button className="purchase-button">Purchase Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasesPage;
