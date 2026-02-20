# Aetherius Vitality 🌟

Aetherius Vitality is a premium, gamified single-page application (SPA) designed to help you transmute your potential into reality through smart goal tracking, health metrics, and an immersive gamification engine.

## 🚀 Features

### 🎮 Gamification Engine
Turn your daily disciplines into an epic journey:
- **XP & Leveling:** Earn Experience Points by logging habits, meditations, and meals. Level up to prove your dedication.
- **Unlockable Titles:** Equip unique titles (like *The Awakened* or *Iron Will*) to show off your rank on the Leaderboard.
- **Achievements:** Earn badges for milestones like perfect streaks and completed quests.
- **Streaks & Quests:** Maintain daily streaks and complete AI-generated daily quests.

### 🏆 Global Leaderboard & Guilds
- **Global Leaderboard:** Sync your progress to a global Firestore database and compete with other Seekers or dynamic AI Bots.
- **Guilds System:** Create and join Guilds, collaborate with other members, and communicate via real-time Guild messaging.

### 🧠 The Alchemist Assistant
- **AI Chatbot:** A fully integrated AI assistant powered by Google Gemini, capable of dispensing health wisdom, tracking progress, and analyzing your meals and macros on the fly. 

### 🧘 Health Trackers
- **Body Metrics & Sleep:** Track measurements, weight, and sleep quality.
- **Meditation Timer:** Built-in focus and breathing presets (Awake, Calm, Box) with pure React hooks tracking active time.
- **Water Logging:** Customizable fluid tracking with visual progress.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (for premium animations and layouts), Lucide React (icons)
- **State Management:** Zustand (with persist middleware for local storage caching)
- **Backend & Database:** Google Firebase (Auth, Firestore)
- **AI Integration:** Google Gemini API
- **Deployment:** Cloudflare Pages (PWA configured visually)

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed along with `npm` or `yarn`.

### 2. Clone the Repository
```bash
git clone https://github.com/hamitcf/Aether-Vitality.git
cd Aether-Vitality
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory by duplicating `.env.example`:
```bash
cp .env.example .env
```
Populate your `.env` with your Firebase Configuration and Gemini API keys. 
*(Note: Refer to `SETUP_GUIDE.md` for detailed instructions on acquiring these keys).*

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the application in your browser.

---

## 🔒 Security Requirements
For the Leaderboard and Guilds to function properly, your connected Firebase account must deploy the custom `firestore.rules` included in the root directory:
```bash
firebase deploy --only firestore:rules
```

## ✨ Design Philosophy
Aether Vitality utilizes a deep, dark mode aesthetic combined with glassmorphism, glowing accents (emerald and amber), and smooth micro-animations. The goal is to make personal development feel premium, deliberate, and deeply interactive.
