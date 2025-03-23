import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/Dashboard"; 
import LeaderboardPage from "./pages/LeaderboardPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UpcomingEventsPage from "./pages/UpcomingEventsPage";
import NewClubsPage from "./pages/NewClubsPage";
import PurchasesPage from "./pages/PurchasesPage";
import MyClubsPage from "./pages/MyClubsPage";
import ClubEventsPage from "./pages/ClubEventsPage";
import RedeemPage from "./pages/RedeemPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome"/>}/>
      <Route path="/welcome" element={<WelcomePage/>}/>
      <Route path="/signup" element={<SignUpPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/dashboard" element={<DashboardPage/>}/> 
      <Route path="/leaderboard" element={<LeaderboardPage/>}/>
      <Route path="/personal-info" element={<PersonalInfoPage/>}/>
      <Route path="/reset-password" element={<ResetPasswordPage/>}/>
      <Route path="/upcoming-events" element={<UpcomingEventsPage/>}/>
      <Route path="/new-clubs" element={<NewClubsPage/>}/>
      <Route path="/purchases" element={<PurchasesPage/>}/>
      <Route path="/my-clubs" element={<MyClubsPage/>}/>
      <Route path="/club-events" element={<ClubEventsPage/>}/>
      <Route path="/redeem" element={<RedeemPage/>}/>
    </Routes>
  );
};

export default App;
