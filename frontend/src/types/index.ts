export interface User {
  id: number;
  userName: string;
  email?: string;
  leetCodeUsername?: string;
  createdAt: string;
}

export interface Problem {
  id: number;
  leetCodeNumber: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Submission {
  id: number;
  userId: number;
  userName: string;
  leetCodeNumber: number;
  problemTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  solvedDate: string;
}

export interface UserStats {
  userId: number;
  userName: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalScore: number;
  weeklySolved: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  score: number;
}
