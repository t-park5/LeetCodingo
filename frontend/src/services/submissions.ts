import { api } from "./api";
import type { Submission, UserStats } from "@/types";

export const submissionsService = {
  create: (data: { userId: number; problemId: number; solvedDate?: string }) =>
    api.post<Submission>("/api/submissions", data),

  getByUser: (userId: number) =>
    api.get<Submission[]>(`/api/submissions/user/${userId}`),

  getStats: (userId: number) =>
    api.get<UserStats>(`/api/submissions/user/${userId}/stats`),

  // Returns { "yyyy-MM-dd": count } for the activity heatmap
  getActivity: (userId: number) =>
    api.get<Record<string, number>>(`/api/submissions/activity/${userId}`),
};
