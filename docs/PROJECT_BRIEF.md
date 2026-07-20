# LeetCodingo Project Brief

## Project Overview

LeetCodingo is a web-based LeetCode study tracker for small friend groups.

The mini project version will focus on simple LeetCode check-ins, solved problem logging, topic tracking, and group leaderboards.

The final project version will expand into a study analytics app that helps users understand their weak algorithm topics and choose what to practice next.

## Main Objective

Build a full-stack web app that starts as a simple LeetCode check-in and leaderboard platform, then grows into a study analytics tool.

The app should help users:

- Log solved LeetCode problems
- Track daily and weekly practice
- See what topics they have practiced
- Compete with friends through a leaderboard
- Analyze weak problem types later
- Get study recommendations based on their practice data

## Project Identity

LeetCodingo is not a LeetCode clone.

It is a study tracking and analytics app for LeetCode users.

The app does not need to host coding problems or run code. Instead, it tracks what users practiced and helps them improve their study habits.

## Tech Stack

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite for MVP
- SQL Server or PostgreSQL can be added later if needed

### Frontend

- React + TypeScript + Vite
- Tailwind CSS (v4)
- shadcn/ui component library (base-nova style)
- React Router for navigation

### Design

- White mode (light theme only)
- Duolingo-inspired: white background with orange (#ff6b00) primary accent
- Layout: fixed 250px sidebar (left) + scrollable main content (right)

### Deployment

- Frontend: Vercel (SPA, static hosting)
- Backend + DB: Synology NAS via Docker container (port forwarding / DDNS)
- API base URL managed via environment variable (`VITE_API_URL`)

### Development Tools

- Cursor as main IDE

## Mini Project MVP

The mini project should stay simple and realistic.

### MVP Features

1. User can create or select a simple user profile.
2. User can add a solved LeetCode problem.
3. User can record problem information:
   - LeetCode number
   - Problem title
   - Difficulty
4. User can view a global leaderboard across all users.
5. User can see basic stats:
   - Total solved
   - Solved by difficulty
   - Weekly solved count

## Final Project Expansion

The final project will turn LeetCodingo into a full study analytics and interactive learning app.

### Final Project Features

1. User authentication (sign up and login with password)
2. LeetCode username connection and auto-sync of recent accepted submissions
3. Topic tag collection from LeetCode problem data
4. Weak topic analysis based on solved tag distribution
5. Topic recommendation system (suggest underrepresented tags)
6. Duolingo-style coding quiz system with topic chapters
7. Optional AI Study Coach (explain weak topics in friendly language)

## Important Design Decision

LeetCode API data should be optional support data, not the core of the app.

LeetCode may provide some public data such as:

- Total solved count
- Easy / Medium / Hard solved count
- Recent accepted submissions
- Submission calendar
- Problem difficulty
- Problem topic tags
- Global problem acceptance rate

However, LeetCode public data may not reliably provide the study-quality data needed for personalized weakness analysis.

Therefore, LeetCodingo should directly store important user study data:

- Attempts count
- Failed count
- Time spent
- Confidence level
- Need review status
- Notes
- Review date
- Whether the user solved, failed, or needs to revisit the problem

## Core Data Models

### User

Represents a LeetCodingo user.

Fields:

- Id
- UserName
- Email
- PasswordHash (BCrypt hashed, added in final project)
- LeetCodeUsername
- CreatedAt

Authentication uses simple JWT tokens. Register and login are handled via `/api/auth/register` and `/api/auth/login`.

### Problem

Represents a LeetCode problem.

Fields:

- Id
- LeetCodeNumber
- Title
- TitleSlug
- Difficulty
- Url
- GlobalAcceptanceRate

### Tag

Represents a LeetCode topic tag (e.g. Array, Dynamic Programming, Tree).

Fields:

- Id
- Name (unique, e.g. "Dynamic Programming")

### ProblemTag

Join table linking problems to their topic tags.

Fields:

- ProblemId
- TagId

Topic tag examples: Array, Hash Table, Two Pointers, Stack, Queue, Binary Search, Tree, Graph, Dynamic Programming, Backtracking, Sliding Window.

### Submission

Represents a solved problem record.

Fields:

- Id
- UserId
- ProblemId
- SolvedDate
- CreatedAt

### Attempt

Represents a study attempt. This is more important for the final project analytics.

Fields:

- Id
- UserId
- ProblemId
- Status
- AttemptsCount
- FailedCount
- TimeSpentMinutes
- ConfidenceLevel
- AttemptDate
- NeedReview
- Notes

Possible Status values:

- Solved
- TriedButFailed
- NeedReview
- Reviewed

### Group

Not used in the mini project MVP. Reserved for a future phase if group-based leaderboards are added later.

### GroupMember

Not used in the mini project MVP. Reserved for a future phase.

### AIInsight

Represents an AI-generated study explanation.

Fields:

- Id
- UserId
- SummaryText
- GeneratedAt
- SourceStatsHash

This should only be used later. The MVP does not need AI.

### LeetCodeProfileSnapshot

Represents synced LeetCode profile data.

Fields:

- Id
- UserId
- LeetCodeUsername
- TotalSolved
- EasySolved
- MediumSolved
- HardSolved
- AcceptanceRate
- Ranking
- SyncedAt

This should be added later, not in the first MVP.

## Scoring System

The leaderboard should use a simple difficulty-based score.

- Easy = 1 point
- Medium = 3 points
- Hard = 5 points

Example:

If a user solves:

- 3 Easy problems
- 4 Medium problems
- 1 Hard problem

The score is:

- 3 * 1 = 3
- 4 * 3 = 12
- 1 * 5 = 5
- Total = 20 points

## Suggested API Endpoints

### Problems

GET /api/problems

GET /api/problems/{id}

POST /api/problems

GET /api/problems?difficulty=Medium

### Submissions

POST /api/submissions

GET /api/submissions/user/{userId}

GET /api/submissions/user/{userId}/today

GET /api/submissions/user/{userId}/stats

### Leaderboard

GET /api/leaderboard

GET /api/leaderboard?range=week

### Groups

Not part of the mini project MVP. Reserved for a future phase.

### Analytics

GET /api/analytics/user/{userId}/weak-topics

GET /api/analytics/user/{userId}/recommendations

These analytics endpoints are for the final project version.

### Auth

POST /api/auth/register

POST /api/auth/login

### LeetCode Sync

POST /api/leetcode/sync/{userId}

GET /api/leetcode/user/{userId}/stats

The sync endpoint fetches recent accepted submissions from LeetCode's unofficial GraphQL API and stores them in the database along with problem tags.

## Weak Topic Algorithm Idea

The final project should calculate weak topics using user-created study data.

Example formula:

WeakTopicScore =
failedRate * 0.35
+ normalizedAverageAttempts * 0.25
+ normalizedAverageTime * 0.20
+ lowConfidenceRate * 0.20

Higher score means the topic needs more practice.

Example:

Dynamic Programming:

- High failed rate
- High average attempts
- High time spent
- Low confidence

Result:

Dynamic Programming should be marked as a weak topic.

## AI Integration Idea

AI should not do the raw analysis.

The backend should calculate the user's weak topics first.

Then AI can explain the result in a short, friendly way.

Good AI input example:

{
  "weakestTopic": "Dynamic Programming",
  "solved": 4,
  "tried": 8,
  "averageAttempts": 3.2,
  "averageTimeMinutes": 52,
  "lowConfidenceRate": 0.75,
  "recommendedPatterns": ["1D DP", "House Robber", "Coin Change"]
}

Good AI output example:

"Your weakest area right now looks like Dynamic Programming. You solved some DP problems, but your average attempts and time are higher than other topics. I recommend focusing on 1D DP first, especially House Robber and Coin Change style problems."

AI should be used only as a study coach explanation layer.

The app should store AI results in the database and avoid calling AI every time the dashboard loads.

## Development Plan

### Phase 1: Backend MVP

Build the backend first.

Tasks:

1. Create ASP.NET Core Web API project.
2. Add Entity Framework Core.
3. Use SQLite for the first version.
4. Create models:
   - User
   - Problem
   - Submission
5. Create AppDbContext.
6. Create migrations.
7. Create ProblemsController.
8. Create SubmissionsController.
9. Create LeaderboardController (global, all users).

No authentication yet.

### Phase 2: Global Leaderboard

Already included in Phase 1.

This phase is reserved for adding group-based leaderboards later if needed.

### Phase 3: Frontend MVP

Build the React frontend.

Pages:

1. Dashboard
2. Add Solved Problem
3. My Progress
4. Leaderboard (global)

### Phase 4: Analytics

Add basic analytics.

Features:

1. Solved by difficulty
2. Solved by topic tag
3. Weekly solved count
4. Weak topic score
5. Simple recommendation list

### Phase 5: Final Project Expansion

Add advanced features.

Features:

1. Sign up and login (password-based auth with JWT)
2. LeetCode username connection and auto-sync
3. Topic tag collection from LeetCode GraphQL API
4. Weak topic analysis and recommendation
5. Duolingo-style coding quiz system
   - Topic chapters (e.g. Array, Tree, Dynamic Programming)
   - Question types: fill in the blank, find the bug, predict the output
   - ~2-3 chapters with ~10 questions each
6. More polished dashboard

## MVP Rule

Do not build everything at once.

The first working version only needs:

- Add a solved problem
- Store it in the database
- Show user progress
- Show global leaderboard

Everything else can come later.