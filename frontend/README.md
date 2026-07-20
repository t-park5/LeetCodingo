# LeetCodingo — Frontend

React + TypeScript + Vite frontend for LeetCodingo.

LeetCodingo is a study tracking and analytics app for LeetCode users. It helps you log solved problems, sync your LeetCode history, analyze weak topics, and practice with Duolingo-style coding quizzes.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (base-nova style)
- React Router
- i18next (internationalization)

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview of recent activity and stats |
| `/add` | Add Problem | Manually log a solved problem |
| `/progress` | My Progress | Personal stats and topic tag breakdown |
| `/leaderboard` | Leaderboard | Global score ranking across all users |
| `/quiz` | Quiz | Duolingo-style coding quiz by topic chapter |
| `/login` | Login | Sign in to your account |
| `/register` | Register | Create a new account |

## Setup

```bash
npm install
npm run dev
```

Create a `.env.local` file in this folder:

```
VITE_API_URL=http://localhost:5000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL for the backend API |

## Project Structure

```
src/
  pages/          # Main route pages
  components/
    layout/       # Sidebar and Layout wrapper
    ui/           # shadcn/ui components
  services/       # API call functions (uses VITE_API_URL)
  types/          # TypeScript type definitions
  lib/
    utils.ts      # cn() helper
```

## Auth

JWT token is stored in localStorage under the key `authToken`.  
Logged-in user object is stored under `currentUser`.

## Scoring

- Easy = 1 point
- Medium = 3 points
- Hard = 5 points
