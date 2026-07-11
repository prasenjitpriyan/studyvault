# ⚡ StudyVault

StudyVault is a premium, responsive, glassmorphic personal knowledge base and study companion. Built using **Next.js 16 (App Router + Turbopack)**, **Tailwind CSS v4**, and **MongoDB/Mongoose**, it unites structured note-taking, active recall testing, and prioritized task management under a stunning adaptive user interface.

---

## ✨ Features

### 1. 📊 Focus Dashboard & Pomodoro Timer
- **High-level Overview**: Instantly view counts of notes, decks, cards to review, and pending items.
- **Pomodoro Timer**: Work (25m) and Break (5m) focus clocks featuring start/pause/reset states.
- **Audio Alerts**: Uses the vanilla browser **Web Audio API** to synthesize completion alarms dynamically, keeping the repository light and eliminating external asset loading issues.

### 2. 📓 Notes Vault
- **Folder Categorization**: Group study documents into dynamic folder categories.
- **Live Split-Screen Markdown Editor**: Side-by-side editing pane alongside an instantly parsed HTML rendering workspace.
- **Debounced Autosave**: Automatic background saving (triggers 1 second after typing stops) via custom PUT endpoints to MongoDB.

### 3. 🃏 Active Recall Decks (Spaced Repetition)
- **SM-2 Spaced Repetition**: Utilises the classic SuperMemo **SM-2 algorithm** (calculating Ease Factors, repetition counts, and intervals) to schedule card practice times.
- **Interactive 3D Flipping**: Sleek CSS 3D perspective animations that flip prompt cards on click.
- **Session Queue**: Generates a dynamic review queue showing cards due for studying.

### 4. 📋 Task Planner
- **Kanban Board**: Drag-free Kanban status columns: *To Do*, *In Progress*, and *Completed*.
- **Task Prioritization**: Prioritize elements (High, Medium, Low) with visual alerts.
- **Overdue Warnings**: Displays flashing alert badges for incomplete tasks whose due date has passed.

### 5. 🎨 Adaptive Theme Switcher
- **Modes**: Support for `Light mode`, `Dark mode`, and `System preference` styles.
- **Flash-Free Load**: Implements a blocking script inside the HTML `<head>` segment to check local storage and media queries before React renders, avoiding flashes.

### 6. 🌐 Dynamic SEO & PWA Metadata
- **Interactive Favicon & Apple Icon**: Dynamically rendered server SVG buffer streams.
- **Social Banners**: Rich dynamic OpenGraph images presenting branding screens and feature badges.
- **PWA Manifest**: Configured `manifest.ts` routing mapping icons, launch parameters, and color schemes.

---

## 🛠️ Tech Stack & Conventions

* **Framework**: Next.js 16.2.10 (App Router, Turbopack)
* **Styling**: Tailwind CSS v4
* **Database**: MongoDB via Mongoose Object Modeling
* **Authentication**: HttpOnly Cookies with JWT token generation using the vanilla Web Crypto API (allowing edge compatibility)
* **Icons**: Lucide React

---

## 📂 Directory Layout

```
├── public/                 # Static assets (manifest, images)
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── api/            # Route endpoints (Auth, Notes, Decks, Tasks)
│   │   ├── dashboard/      # Protected dashboard views
│   │   ├── login/          # Auth sign-in screen
│   │   ├── signup/         # Auth signup screen
│   │   ├── layout.tsx      # App wrapper, theme initialisation
│   │   ├── globals.css     # CSS utility classes & Tailwind theme config
│   │   └── page.tsx        # Responsive marketing Landing page
│   ├── components/         # Reusable Client/Server UI Components
│   │   └── ThemeToggle.tsx # Modular light/dark theme switch control
│   ├── lib/
│   │   ├── auth.ts         # Crypto Web JWT hashing & verifying utility
│   │   └── db.ts           # Mongoose MongoDB connection helper
│   ├── models/             # Mongoose Schemas (User, Note, Deck, Card, Task)
│   └── proxy.ts            # Route Interceptor (Dashboard session mapper)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 🔧 Installation & Environment Setup

1. Clone the repository and navigate to the directory:
   ```bash
   cd studyvault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following keys:
   ```env
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_secure_jwt_string_secret
   ```

### 💻 Running Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the landing screen.

---

## 🧪 Build & Linting

Before pushing your changes, ensure the codebase builds and compiles cleanly without errors:

* **Format / Lint Checks**:
  ```bash
  npm run lint
  ```
* **Production Build Compilation**:
  ```bash
  npm run build
  ```
