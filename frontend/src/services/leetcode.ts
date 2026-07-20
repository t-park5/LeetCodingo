import { api } from "./api";
import type { SyncResult, TagStat } from "@/types";

export const leetcodeService = {
  sync: (userId: number) =>
    api.post<SyncResult>(`/api/leetcode/sync/${userId}`, {}),

  getTagStats: (userId: number) =>
    api.get<TagStat[]>(`/api/leetcode/tags/${userId}`),
};
