# GitHub Copilot Instructions for LeetCodingo

LeetCodingo is a beginner-friendly full-stack web app for tracking LeetCode practice with friends.

The mini project version is a LeetCode check-in and leaderboard app.

The final project version will become a study analytics app that helps users identify weak problem types and get study recommendations.

## Tech Stack

- Backend: ASP.NET Core Web API
- Language: C#
- Database: SQLite for MVP
- ORM: Entity Framework Core
- Frontend: React + TypeScript + Vite
- UI Library: Tailwind CSS (v4) + shadcn/ui (base-nova style)
- Routing: React Router
- Version Control: Git and GitHub
- Frontend Deploy: Vercel (SPA)
- Backend Deploy: Synology NAS via Docker (DDNS + port forwarding)

## Environment Variables

The frontend uses `VITE_API_URL` to point to the backend.

- `.env.local` for local development (e.g. `http://localhost:5000`)
- `.env.production` for production (e.g. NAS DDNS address)

## Design Guidelines

- White mode only (no dark mode in MVP)
- Primary color: orange (#ff6b00), inspired by Duolingo
- Layout: fixed 250px sidebar on left, scrollable main content on right
- Use shadcn/ui components: Button, Card, Table, Badge

## Main Project Reference

Use `docs/PROJECT_BRIEF.md` as the main source of truth for project goals, data models, API design, and development phases.

## Development Style

- Build this project step by step.
- Keep the code beginner-friendly and readable.
- Prefer simple, clear code over advanced patterns.
- Do not add authentication until requested.
- Do not add AI integration until the core MVP works.
- Do not add LeetCode API sync until the manual tracking MVP works.
- Avoid unnecessary packages.
- Explain important code changes when asked.
- Keep backend and frontend separated.

## Backend Rules

- Use ASP.NET Core Web API.
- Use Entity Framework Core.
- Use SQLite for the first MVP.
- Put data models in a `Models` folder.
- Put DbContext in a `Data` folder.
- Put API controllers in a `Controllers` folder.
- Use DTOs when request or response shapes should not directly expose database models.
- Use async methods for database operations.
- Validate basic input in controllers or services.
- Keep controller methods simple.

## Frontend Rules

- Use React + TypeScript.
- Use Tailwind CSS (v4) for styling.
- Use shadcn/ui components. Do not build UI primitives from scratch.
- Use React Router for navigation.
- Keep all API calls in `src/services/`.
- Use `VITE_API_URL` environment variable for all API base URLs.
- Keep components small and readable.
- Do not add dark mode in the MVP.
- Build pages in this order:
  1. Dashboard
  2. Add Solved Problem
  3. My Progress
  4. Leaderboard (global)

## MVP Priority

The first working version should support:

1. Creating or selecting a user
2. Adding a solved LeetCode problem (number, title, difficulty only)
3. Viewing personal progress (total solved, by difficulty, weekly count)
4. Viewing a global leaderboard across all users

## Scoring Rule

Use this leaderboard scoring system:

- Easy = 1 point
- Medium = 3 points
- Hard = 5 points

## Important Reminder

LeetCodingo is not a LeetCode clone.

It does not need to run code or host coding problems.

It is a tracking, leaderboard, and study analytics app.