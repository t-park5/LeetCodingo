import { api } from "./api";
import type { User } from "@/types";

export const usersService = {
  getAll: () => api.get<User[]>("/api/users"),

  getById: (id: number) => api.get<User>(`/api/users/${id}`),

  create: (data: { userName: string; leetCodeUsername?: string; email?: string }) =>
    api.post<User>("/api/users", data),
};
