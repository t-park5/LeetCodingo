import { api } from "./api";
import type { Problem } from "@/types";

export const problemsService = {
  getAll: (difficulty?: string) =>
    api.get<Problem[]>(`/api/problems${difficulty ? `?difficulty=${difficulty}` : ""}`),

  getById: (id: number) => api.get<Problem>(`/api/problems/${id}`),

  create: (data: { leetCodeNumber: number; title: string; difficulty: string }) =>
    api.post<Problem>("/api/problems", data),
};
