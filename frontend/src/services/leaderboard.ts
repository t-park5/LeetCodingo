import { api } from "./api";
import type { LeaderboardEntry } from "@/types";

export const leaderboardService = {
  get: (range?: "week") =>
    api.get<LeaderboardEntry[]>(`/api/leaderboard${range ? `?range=${range}` : ""}`),
};
