import { api } from "./api";
import type { QuizChapter, QuizQuestion } from "@/types";

export const quizService = {
  getChapters: () => api.get<QuizChapter[]>("/api/quiz/chapters"),

  getQuestions: (chapterId: number) =>
    api.get<QuizQuestion[]>(`/api/quiz/chapters/${chapterId}/questions`),
};
