import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/Dashboard"; 
import LeaderboardPage from "./pages/LeaderboardPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} /> 
      <Route path="/leaderboard" element={<LeaderboardPage/>}/>
      <Route path="/personal-info" element={<PersonalInfoPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
};

export default App;
