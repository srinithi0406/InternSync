<div align="center">

#  InternSync

**Your smart internship companion — track tasks, reflect, and generate AI-powered reports.**

Built with React, Supabase, and Groq AI

[![Live Demo](https://img.shields.io/badge/Live-Demo-00D4FF?style=for-the-badge&logo=vercel&logoColor=white)](https://internsync.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-8B5CF6?style=for-the-badge&logo=render&logoColor=white)](https://internsync-backend.onrender.com)

</div>

---

##  Overview

**InternSync** is a full-stack web application designed to help students and interns manage their internship journey in one place. Log daily tasks, write journal-style reflections, visualize your progress on an interactive dashboard, and generate polished, submission-ready internship reports using AI — all from a sleek, dark-themed interface.

---

## Features

###  Landing Page
- Animated hero section with typewriter effect
- Glassmorphism design with aurora background effects
- Feature showcase and how-it-works timeline

###  Task Management
- Log daily internship tasks with title, description, date, hours, difficulty, and status
- Tag tasks with skills from a searchable dropdown
- Filter tasks by status (All / Completed / In Progress / Blocked)
- Edit and delete tasks inline

###  Reflections Journal
- Diary-style weekly reflections with a notebook UI
- Handwritten font (Satisfy) for an authentic journal feel
- Four guided prompts: *What I worked on, What went well, What was difficult, What's next*
- Browse past entries in a sidebar

###  Dashboard & Analytics
- **Stat cards** — Total tasks, completed, in-progress, hours logged
- **Bar chart** — Hours logged per week
- **Pie chart** — Task status breakdown (completed vs in-progress vs blocked)
- **Radar chart** — Skill proficiency visualization
- **Horizontal bar chart** — Most used skills
- **Difficulty breakdown** — Animated progress bars

###  AI Report Generator
- Generates professional, college-submission-ready internship reports
- Powered by **Groq API** (LLaMA 3.3 70B)
- Extracts achievements, challenges, skills gained, and a full narrative report
- Export as **Markdown** or **PDF**
- Editable sections — tweak the AI output before exporting

###  Authentication
- Email/password signup and login via **Supabase Auth**
- Protected routes with `AuthGuard` component
- "Back to Home" navigation on all protected pages

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router, Framer Motion |
| **Styling** | Vanilla CSS (dark theme, glassmorphism, custom design system) |
| **Charts** | Recharts (Bar, Pie, Radar) |
| **Backend** | Node.js, Express |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **AI** | Groq API (LLaMA 3.3 70B Versatile) |
| **PDF Export** | jsPDF |
| **Icons** | Lucide React |
| **Fonts** | Syne, Plus Jakarta Sans, Nunito, Satisfy, JetBrains Mono |

---

##  Screenshots

<!-- Add your screenshots to the assets/ folder and uncomment these -->

<!--
### Landing Page
![Landing Page](assets/landing.png)

### Task Management
![Tasks Page](assets/tasks.png)

### Reflections Journal
![Reflections](assets/reflections.png)

### Dashboard
![Dashboard](assets/dashboard.png)

### AI Report Generator
![Reports](assets/reports.png)
-->

---

##  How to run this locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) project with `internships`, `tasks`, and `reflections` tables
- A [Groq](https://console.groq.com/) API key

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/internsync.git
cd internsync
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set up environment variables

**Frontend** — create `.env` in the project root:
```env
VITE_API_URL=http://localhost:5000
```

**Backend** — create `.env` inside `backend/`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** Supabase credentials are configured in `src/services/supabase.js`.

### 5. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
node server.js
```

```bash
# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
internsync/
├── backend/                    # Express API server
│   ├── routes/
│   │   └── generateReport.js   # AI report generation endpoint
│   ├── server.js               # Express app entry point
│   └── .env                    # GROQ_API_KEY
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AuthGuard.jsx       # Route protection
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── HeroSection.jsx     # Landing page hero
│   │   ├── FeatureCard.jsx     # Feature display cards
│   │   └── ...
│   ├── pages/                  # Route pages
│   │   ├── Home.jsx            # Landing page
│   │   ├── Auth.jsx            # Login / Signup
│   │   ├── Tasks.jsx           # Task management
│   │   ├── Reflections.jsx     # Journal / Diary
│   │   ├── Dashboard.jsx       # Analytics & Charts
│   │   └── Reports.jsx         # AI Report Generator
│   ├── services/
│   │   └── supabase.js         # Supabase client config
│   ├── index.css               # Complete design system
│   ├── App.jsx                 # Router setup
│   └── main.jsx                # App entry point
├── .env                        # VITE_API_URL
├── package.json
├── vite.config.js
└── index.html
```

---

##  Deployment

| Service | What |
|---------|------|
| **Vercel** | Frontend (React + Vite) |
| **Render** | Backend (Express API) |

Set `VITE_API_URL` on Vercel to point to your Render backend URL.

---



