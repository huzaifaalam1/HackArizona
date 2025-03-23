import React, { useEffect, useState } from "react";
import "./PersonalInfoPage.css"; 
import { getUserData } from "../firebaseFunctions";

const PersonalInfoPage = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getUserData();
      console.log("Fetched user data:", data);
      setUserInfo(data);
    };
    fetchInfo();
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-heading">Personal Information</h2>
      {userInfo ? (
        <div className="info-box">
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Badge:</strong> {userInfo.badge}</p>
          <p><strong>Points:</strong> {userInfo.points}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PersonalInfoPage;
