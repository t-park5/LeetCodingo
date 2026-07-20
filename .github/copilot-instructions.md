# GitHub Copilot Instructions for LeetCodingo

LeetCodingo is a beginner-friendly full-stack web app for tracking LeetCode practice with friends.

The mini project version is a LeetCode check-in and leaderboard app.

The final project version is a study analytics and interactive learning app with LeetCode sync, topic tag analysis, weak topic recommendations, and a Duolingo-style coding quiz system.

## Tech Stack

- Backend: ASP.NET Core Web API
- Language: C#
- Database: SQLite
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

- White mode only (no dark mode)
- Primary color: orange (#ff6b00), inspired by Duolingo
- Layout: fixed 250px sidebar on left, scrollable main content on right
- Use shadcn/ui components: Button, Card, Table, Badge

## Main Project Reference

Use `docs/PROJECT_BRIEF.md` as the main source of truth for project goals, data models, API design, and development phases.

## Development Style

- Build this project step by step.
- Keep the code beginner-friendly and readable.
- Prefer simple, clear code over advanced patterns.
- Avoid unnecessary packages.
- Explain important code changes when asked.
- Keep backend and frontend separated.

## Current Phase: Final Project

The following features are in scope for the final project:

1. **Authentication** — Sign up and login with password. Use BCrypt for hashing. Issue a simple JWT token on login. Store the token in localStorage on the frontend.
2. **LeetCode Sync** — Fetch recent accepted submissions from LeetCode's unofficial GraphQL API using the user's LeetCode username. Store problems and their topic tags in the database.
3. **Tag Analytics** — Track which topic tags the user has solved. Show a breakdown by tag. Identify underrepresented tags as weak areas and recommend them.
4. **Duolingo-style Quiz** — Topic-based chapters (e.g. Array, Tree, Dynamic Programming). Each chapter has ~10 questions. Question types: fill in the blank, find the bug, predict the output. Seed question data manually.

## Backend Rules

- Use ASP.NET Core Web API.
- Use Entity Framework Core.
- Use SQLite.
- Put data models in a `Models` folder.
- Put DbContext in a `Data` folder.
- Put API controllers in a `Controllers` folder.
- Use DTOs when request or response shapes should not directly expose database models.
- Use async methods for database operations.
- Validate basic input in controllers or services.
- Keep controller methods simple.
- For LeetCode sync, use `HttpClient` to call LeetCode's GraphQL API from the backend. Do not call it from the frontend.
- Auth endpoints go in `AuthController`. Use `BCrypt.Net-Next` for password hashing and `System.IdentityModel.Tokens.Jwt` for JWT.

## Frontend Rules

- Use React + TypeScript.
- Use Tailwind CSS (v4) for styling.
- Use shadcn/ui components. Do not build UI primitives from scratch.
- Use React Router for navigation.
- Keep all API calls in `src/services/`.
- Use `VITE_API_URL` environment variable for all API base URLs.
- Keep components small and readable.
- Do not add dark mode.
- Store JWT token in localStorage under the key `authToken`. Store the logged-in user object under `currentUser`.
- Protect authenticated routes by checking for a valid `authToken` in localStorage.

## Scoring Rule

Use this leaderboard scoring system:

- Easy = 1 point
- Medium = 3 points
- Hard = 5 points

## Important Reminder

LeetCodingo is not a LeetCode clone.

It does not need to run code or host coding problems.

It is a tracking, leaderboard, study analytics, and interactive learning app.
