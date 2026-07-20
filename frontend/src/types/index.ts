export interface User {
  id: number;
  userName: string;
  email?: string;
  leetCodeUsername?: string;
  currentStreak: number;
  weeklyGoalLessons: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  userName: string;
  email?: string;
  leetCodeUsername?: string;
}

export interface TagStat {
  tagName: string;
  count: number;
}

export interface SyncResult {
  newProblemsAdded: number;
  submissionsSynced: number;
  message: string;
}

export interface QuizChapter {
  id: number;
  title: string;
  description: string;
  order: number;
  unitTitle?: string;
  questionCount: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  bestScore?: number;
}

export interface QuizQuestion {
  id: number;
  questionType: "FillBlank" | "FindBug" | "PredictOutput";
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
}

export interface SubmitLessonRequest {
  userId: number;
  chapterId: number;
  score: number;
  totalQuestions: number;
  wrongQuestionIds: number[];
}

export interface SubmitLessonResponse {
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
  lessonsCompletedThisWeek: number;
  weeklyGoal: number;
}

export interface WrongAnswerItem {
  wrongAnswerId: number;
  question: QuizQuestion;
  lastAttemptedAt: string;
}

export interface CheckInResponse {
  currentStreak: number;
  isNewDay: boolean;
  message: string;
}

export interface WeeklyGoalResponse {
  goalLessons: number;
  completedThisWeek: number;
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
