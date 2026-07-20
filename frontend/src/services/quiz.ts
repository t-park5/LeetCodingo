import { api } from "./api";
import type {
  QuizChapter,
  QuizQuestion,
  SubmitLessonRequest,
  SubmitLessonResponse,
  WrongAnswerItem,
} from "@/types";

export const quizService = {
  getChapters: (userId?: number) =>
    api.get<QuizChapter[]>(
      userId ? `/api/quiz/chapters?userId=${userId}` : "/api/quiz/chapters"
    ),

  getQuestions: (chapterId: number) =>
    api.get<QuizQuestion[]>(`/api/quiz/chapters/${chapterId}/questions`),

  getQuestionsByType: (questionType: string, limit = 10) =>
    api.get<QuizQuestion[]>(`/api/quiz/bytype/${questionType}?limit=${limit}`),

  submitLesson: (data: SubmitLessonRequest) =>
    api.post<SubmitLessonResponse>("/api/quiz/submit", data),

  getWrongAnswers: (userId: number) =>
    api.get<WrongAnswerItem[]>(`/api/quiz/review/${userId}`),

  resolveWrongAnswer: (wrongAnswerId: number) =>
    api.put<void>(`/api/quiz/review/${wrongAnswerId}/resolve`, {}),

  skipChapter: (chapterId: number, userId: number) =>
    api.post<void>(`/api/quiz/chapters/${chapterId}/skip?userId=${userId}`, {}),
};
