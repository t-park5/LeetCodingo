import { api } from "./api";
import type { User, CheckInResponse, WeeklyGoalResponse } from "@/types";

export const usersService = {
  getAll: () => api.get<User[]>("/api/users"),

  getById: (id: number) => api.get<User>(`/api/users/${id}`),

  create: (data: { userName: string; leetCodeUsername?: string; email?: string }) =>
    api.post<User>("/api/users", data),

  checkIn: (userId: number) =>
    api.post<CheckInResponse>(`/api/users/${userId}/checkin`, {}),

  updateGoal: (userId: number, weeklyGoalLessons: number) =>
    api.put<WeeklyGoalResponse>(`/api/users/${userId}/goal`, { weeklyGoalLessons }),
};
