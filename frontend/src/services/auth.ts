import { api } from "./api";
import type { AuthResponse } from "@/types";

export const authService = {
  register: (data: {
    userName: string;
    password: string;
    email?: string;
    leetCodeUsername?: string;
  }) => api.post<AuthResponse>("/api/auth/register", data),

  login: (data: { userName: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),

  saveSession(auth: AuthResponse) {
    localStorage.setItem("authToken", auth.token);
    localStorage.setItem("currentUser", JSON.stringify({
      id: auth.userId,
      userName: auth.userName,
      email: auth.email,
      leetCodeUsername: auth.leetCodeUsername,
    }));
    // Keep selectedUserId in sync for existing pages
    localStorage.setItem("selectedUserId", String(auth.userId));
  },

  clearSession() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("selectedUserId");
  },

  getCurrentUser() {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        id: number;
        userName: string;
        email?: string;
        leetCodeUsername?: string;
      };
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem("authToken");
  },
};
