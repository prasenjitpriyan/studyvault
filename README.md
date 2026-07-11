<div align="center">

# ⚡ StudyVault

### Your Ultimate Knowledge & Study Hub

**A premium, AI-powered, responsive study companion built for serious learners.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-studyvault--tawny--omega.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://studyvault-tawny-omega.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 🌐 Live Deployment

> **Production URL:** [https://studyvault-tawny-omega.vercel.app/](https://studyvault-tawny-omega.vercel.app/)

Deployed on **Vercel** with automatic CI/CD from the `main` branch. All routes — API, auth, and static pages — are served globally via Vercel's edge network.

---

## 📸 Overview

StudyVault is a full-stack, production-ready personal knowledge base and study companion. It unites:

- **Structured note-taking** with live Markdown preview
- **Active recall** via spaced-repetition flashcard decks (SM-2 algorithm)
- **Kanban task management** with priority and due-date tracking
- **AI Study Assistant** for note summarisation and auto-generating flashcards
- **Pomodoro focus timer** with audio alerts
- **Bookmark / Favourites** system for quick note access
- **Voice reading** (Web Speech API text-to-speech)
- **PDF export** of notes for offline study
- **Dark / Light / System** adaptive theme with zero flash-on-load
- **GSAP animations** on the landing page and dashboard
- **Full mobile responsiveness** with collapsible sidebars
- **Study-optimised typography** — 68ch reading width, 1.85 line-height, eye-friendly contrast palette

---

## ✨ Feature Reference

### 1. 📊 Focus Dashboard & Pomodoro Timer
- Live stats overview: total notes, flashcard decks, cards due, and open tasks
- **Pomodoro Timer**: 25-minute work / 5-minute break cycles with start / pause / reset
- Audio completion alert synthesised with the **Web Audio API** — no external assets required
- Hover microanimations and GSAP staggered entrance timeline on dashboard load

### 2. 📓 Notes Vault (Markdown Editor)
- **Folder categorisation** — group notes into dynamic topics/subjects
- **⭐ Bookmarks & Favourites** — star any note; filter to "⭐ Favourites" folder instantly
- **Live split-screen editor**: Write pane (monospace) + instant Markdown preview side-by-side
- **Write / Preview / Split** toggle modes
- **Debounced autosave** — persists to MongoDB 1 second after typing stops
- **Full-text search** — filter notes by title in real time
- **Voice reading** — plays back note content via the Web Speech API (SpeechSynthesis); stop button visible while reading
- **PDF export** — triggers browser print with print-specific CSS scoped to the note content only
- **Markdown support**: headings (`#` / `##` / `###`), bold, italic, inline code, fenced code blocks, blockquotes, ordered & unordered lists, horizontal rules
- **AI Study Assistant drawer** (right-hand panel):
  - **Summarise** — generates a bullet-point summary of the active note
  - **Generate Cards** — extracts Q&A pairs from note content and creates flashcards in a selected deck
  - **Save Cards to Deck** — persists AI-generated cards to MongoDB in one click

### 3. 🃏 Active Recall Flashcard Decks
- **SM-2 Spaced Repetition** — classic SuperMemo algorithm calculates Ease Factor, repetitions, and next review interval per card
- **Deck library view** — grid of all decks with Study and Manage quick-actions
- **Interactive 3D flip card** — CSS `perspective` + `rotateY` animation on click to reveal answers
- **Grading buttons** (after flip): Hard / Good / Easy — updates SM-2 state server-side
- **Card Manager table** — view, add, delete individual cards within a deck
- **AI card ingestion** — cards auto-created from notes via the AI Assistant

### 4. 📋 Task Planner (Kanban Board)
- Three-column Kanban: **To Do** → **In Progress** → **Completed**
- Left / Right arrow buttons move tasks across columns
- **Priority badges**: High (red) / Medium (amber) / Low (grey)
- **Overdue indicator** — pulsing red calendar icon if due date has passed
- **Add Task modal** with title, priority selector, and optional due date

### 5. 🎨 Adaptive Theme System
- **Three modes**: Light, Dark, System preference
- Inline blocking script in `<head>` reads `localStorage` before React hydrates — **zero flash on reload**
- Study-optimised colour palette:
  - Dark mode: `#0d0d14` background + `#dde1ea` foreground (≈86% luminance — reduces eye fatigue vs pure white-on-black)
  - Light mode: `#f7f7fb` + `#1c1c2e` (warm off-white + deep blue-grey — reduces photostress vs stark white)

### 6. 📖 Study-Optimised Typography
- Body: **15px**, `line-height: 1.65`, `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`
- Prose reading area (`.study-prose`): **68ch** max-width, **1.85 line-height** — per Baymard Institute reading research
- Markdown editor (`.study-editor`): JetBrains Mono / Geist Mono, **14px**, 1.9 line-height, indigo caret
- Flashcard text (`.flashcard-text`): 1.05rem, 1.7 line-height for clear Q&A hierarchy
- Pomodoro timer (`.timer-display`): `font-variant-numeric: tabular-nums` — digits don't jump width

### 7. 🌐 SEO, PWA & Metadata
- Dynamic server-rendered **Favicon** and **Apple Touch Icon** (SVG → PNG buffer streams)
- **OpenGraph social preview image** with branding and feature badges
- **PWA manifest** (`/manifest.webmanifest`) — icons, launch URL, theme colours
- `<title>` and `<meta description>` on every page

### 8. 🎭 GSAP Animations
- **Landing page**: staggered hero text, CTA buttons, feature cards, and SVG orbital rings entrance timeline
- **Dashboard**: stat cards and timer panel staggered reveal on mount
- **Hover microanimations**: card lift + glow on feature/stat cards
- **Mobile menu**: animated hamburger-to-close icon transition

### 9. 📱 Full Mobile Responsiveness
- Collapsible sidebar on the Notes page (hamburger toggle, overlay backdrop)
- Top navigation bar on mobile Dashboard with responsive Kanban/Note grid
- Mobile-first CSS breakpoints throughout; arbitrary `min-[480px]:` for CTA row
- Tested at 375px, 480px, 768px, 1024px, 1280px+ viewports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.10 (App Router, Turbopack) |
| **Styling** | Tailwind CSS v4 + custom CSS (glassmorphism, study-prose, GSAP targets) |
| **Animations** | GSAP 3 (GreenSock) |
| **Database** | MongoDB Atlas via Mongoose ODM |
| **Authentication** | HttpOnly Cookie + JWT (Web Crypto API — edge-compatible, no Node.js crypto) |
| **AI Features** | Simulated AI responses (client-side — drop-in ready for any LLM API) |
| **Icons** | Lucide React |
| **Notifications** | Sonner toast library |
| **Deployment** | Vercel (Serverless + Edge Middleware) |

---

## 📂 Project Structure

```
studyvault/
├── public/                       # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # POST /api/auth  (login, signup, logout)
│   │   │   ├── notes/            # CRUD /api/notes, /api/notes/[id]
│   │   │   ├── decks/            # CRUD /api/decks, /api/decks/[id]
│   │   │   ├── decks/[id]/
│   │   │   │   └── flashcards/   # CRUD flashcards within a deck
│   │   │   ├── flashcards/[id]/  # PUT (SM-2 grade), DELETE
│   │   │   └── tasks/            # CRUD /api/tasks, /api/tasks/[id]
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Sidebar + mobile nav layout
│   │   │   ├── page.tsx          # Dashboard home (stats + Pomodoro)
│   │   │   ├── notes/page.tsx    # Full notes vault + AI drawer
│   │   │   ├── flashcards/       # Deck library, practice, card manager
│   │   │   └── tasks/            # Kanban task board
│   │   ├── login/page.tsx        # Auth sign-in screen
│   │   ├── signup/page.tsx       # Auth registration screen
│   │   ├── layout.tsx            # Root layout, font loading, theme script
│   │   ├── globals.css           # Design tokens, study typography, utilities
│   │   ├── icon.tsx              # Dynamic favicon (server SVG)
│   │   ├── apple-icon.tsx        # Dynamic Apple Touch Icon
│   │   ├── opengraph-image.tsx   # OG social preview image
│   │   └── manifest.ts           # PWA manifest route handler
│   ├── components/
│   │   ├── LandingClient.tsx     # GSAP-animated marketing landing page
│   │   └── ThemeToggle.tsx       # Three-mode theme switcher (Light/Dark/System)
│   ├── lib/
│   │   ├── auth.ts               # JWT sign / verify (Web Crypto API)
│   │   └── db.ts                 # Mongoose connection with connection caching
│   ├── models/
│   │   ├── User.ts               # username, email, passwordHash
│   │   ├── Note.ts               # title, content, folder, userId, bookmarked
│   │   ├── Deck.ts               # name, description, userId
│   │   ├── Flashcard.ts          # front, back, deckId, SM-2 state fields
│   │   └── Task.ts               # title, status, priority, dueDate, userId
│   └── middleware.ts             # Edge middleware — protects /dashboard/* routes
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier

### 1. Clone & Install

```bash
git clone https://github.com/prasenjitpriyan/studyvault.git
cd studyvault
npm install
```

### 2. Environment Variables

Create a `.env.local` file at the project root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_jwt_secret_string
```

> **Tip:** For `JWT_SECRET`, use at least 32 random characters. Generate one with:
> ```bash
> openssl rand -base64 32
> ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page will appear.

---

## 🧪 Quality Checks

```bash
# ESLint — lint all TypeScript/TSX files
npm run lint

# TypeScript — full type-check + production build
npm run build
```

Both commands must exit with **0 errors** before pushing to `main`.

---

## 🔑 Authentication Flow

1. **Signup** — password is hashed with **PBKDF2** via the Web Crypto API; user record stored in MongoDB
2. **Login** — password verified; a signed **JWT** is set as an `HttpOnly` `SameSite=Strict` cookie
3. **Protected Routes** — Next.js **Edge Middleware** (`middleware.ts`) checks for a valid JWT cookie on every `/dashboard/*` request; unauthenticated users are redirected to `/login`
4. **Logout** — clears the cookie server-side; client redirected to `/`

---

## 🎨 Design System

All design tokens are CSS custom properties defined in `globals.css`:

| Token | Purpose |
|---|---|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` | Card / panel surface |
| `--muted` | Subtle backgrounds |
| `--muted-foreground` | Secondary / caption text |
| `--border` | All borders |
| `--primary` | Indigo accent (`#6366f1`) |
| `--study-text` | Reading-area body text |
| `--study-heading` | Heading colour in prose |
| `--study-line-height` | `1.85` — prose line spacing |
| `--study-max-width` | `68ch` — optimal reading width |
| `--study-font-size` | `0.9375rem` (15px) |

Utility classes exposed: `.glass-panel`, `.glass-card-hover`, `.text-gradient`, `.study-prose`, `.study-editor`, `.flashcard-text`, `.timer-display`, `.scrollbar-none`, `.perspective-1000`, `.preserve-3d`, `.backface-hidden`

---

## 🌍 Deployment (Vercel)

The app is live at **[https://studyvault-tawny-omega.vercel.app/](https://studyvault-tawny-omega.vercel.app/)**.

### Deploy Your Own Fork

1. Push your fork to GitHub
2. Import the repository on [vercel.com/new](https://vercel.com/new)
3. Set the following **Environment Variables** in the Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Click **Deploy** — Vercel auto-detects Next.js and configures the build

> The API routes run as **Vercel Serverless Functions**. Edge Middleware (`middleware.ts`) runs at the edge for fast auth checks.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for students who take their learning seriously.

**[🚀 Visit StudyVault →](https://studyvault-tawny-omega.vercel.app/)**

</div>
