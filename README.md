# 🏆 MyCampusRewards

MyCampusRewards is a gamified web application designed for students at the University of Arizona. The platform rewards students for engaging with campus life — attending events, joining clubs, and participating in student-led activities — by awarding points, badges, and milestone achievements.

---

## 🚀 Features

### 🎯 Points System
- Students earn points by attending university events and participating in campus life.
- Points contribute to unlocking **league milestones** and determining leaderboard rankings.

### 🧭 League Milestones
- A tiered milestone system that reflects a student’s engagement level:
  - **Unranked**: 0–50 points
  - **Wildcat Cubs**: 51–150 points
  - **Campus Climber**: 151–300 points
  - **McKale Minions**: 301–600 points
  - **Social Scholar**: 601–1000 points
  - **Wildcat Warlord**: 1001–1500 points
  - **Master of the Mall**: 1501+ points
- Milestones are displayed dynamically based on the user’s current points.

### 🏅 Badges and Multipliers
- Users buy badges (Bronze, Silver, Gold) that multiply the value of points earned.
- Badges serve both as a visual achievement and a reward boost.

### 📈 Leaderboard
- Displays the top 5 students with the highest point totals.
- Encourages friendly competition and recognition of active students.

### 📜 Activity Log
- Shows the most recent events or actions where the student earned points.
- Useful for tracking involvement and history.

### 💬 Chatbot Assistant
- A built-in chatbot helps students navigate the app and learn how to earn rewards.

## 🔐 Authentication
- Students must log in with their university credentials. Session management is handled via Firebase Auth, and user data is stored in the Firestore database under a `users` collection.

🔧 Future Improvements:
🎟️ Event check-ins via QR codes
🧩 Integrate club participation APIs
📱 Progressive Web App (PWA) support
🥇 Achievement badges and trophy case
💸 CatCash/Meal swipe redemption system
💳 Stripe API for Badge Upgrades & Donations
    - Integrate Stripe to allow users to:
        - Donate to university causes in exchange for limited-time multipliers or premium badges.
        - Purchase exclusive virtual merchandise (e.g., golden badge skin).
        - Join premium "sponsor" leagues with leaderboard boosts.
📆 Calendar Sync with Events to remind students of eligible reward events and deadlines.
📊 Admin Dashboard & Analytics