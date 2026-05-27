import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MascotBubble from "@/components/MascotBubble";
import mascotLeaderboard from "@/assets/mascot_leaderboard.png";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { leaderboardService } from "@/services/leaderboard";
import type { LeaderboardEntry } from "@/types";

const MEDAL: Record<number, { emoji: string; badge: string }> = {
  1: { emoji: "🥇", badge: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  2: { emoji: "🥈", badge: "bg-gray-100 text-gray-600 border-gray-300" },
  3: { emoji: "🥉", badge: "bg-orange-100 text-orange-700 border-orange-300" },
};

function LeaderboardTable({ entries, currentUserId }: {
  entries: LeaderboardEntry[];
  currentUserId: number;
}) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl mb-3">{t("leaderboard.emptyEmoji")}</p>
        <p className="font-extrabold text-lg text-foreground mb-1">{t("leaderboard.emptyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("leaderboard.emptySubtitle")}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2">
          <TableHead className="w-16 font-bold text-foreground">{t("leaderboard.rank")}</TableHead>
          <TableHead className="font-bold text-foreground">{t("leaderboard.user")}</TableHead>
          <TableHead className="text-center font-bold text-green-600">Easy</TableHead>
          <TableHead className="text-center font-bold text-yellow-600">Medium</TableHead>
          <TableHead className="text-center font-bold text-red-600">Hard</TableHead>
          <TableHead className="text-center font-bold text-foreground">{t("leaderboard.total")}</TableHead>
          <TableHead className="text-right font-bold text-[#ff6b00]">{t("leaderboard.score")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const isMe = entry.userId === currentUserId;
          const medal = MEDAL[entry.rank];
          return (
            <TableRow
              key={entry.userId}
              className={`border-b transition-colors ${
                isMe ? "bg-[#fff3e0] font-semibold" : "hover:bg-secondary/50"
              }`}
            >
              <TableCell className="py-4">
                {medal ? (
                  <Badge
                    className={`${medal.badge} border font-bold px-2.5 py-1 rounded-full text-sm w-fit`}
                  >
                    {medal.emoji} {entry.rank}
                  </Badge>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground pl-2">
                    {entry.rank}
                  </span>
                )}
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                      isMe ? "bg-[#ff6b00]" : "bg-secondary-foreground/20"
                    }`}
                  >
                    {entry.userName[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm">
                    {entry.userName}
                    {isMe && (
                      <span className="ml-1.5 text-xs text-[#ff6b00] font-bold">
                        {t("leaderboard.me")}
                      </span>
                    )}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-center text-sm font-semibold text-green-600">
                {entry.easySolved}
              </TableCell>
              <TableCell className="text-center text-sm font-semibold text-yellow-600">
                {entry.mediumSolved}
              </TableCell>
              <TableCell className="text-center text-sm font-semibold text-red-600">
                {entry.hardSolved}
              </TableCell>
              <TableCell className="text-center text-sm font-semibold text-foreground">
                {entry.totalSolved}
              </TableCell>
              <TableCell className="text-right">
                <span className="text-base font-extrabold text-[#ff6b00]">
                  {entry.score}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">
                    {t("leaderboard.pt")}
                  </span>
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function LeaderboardPage() {
  const { t } = useTranslation();
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [weekly, setWeekly] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = Number(localStorage.getItem("selectedUserId"));

  useEffect(() => {
    Promise.all([
      leaderboardService.get(),
      leaderboardService.get("week"),
    ])
      .then(([all, week]) => { setAllTime(all); setWeekly(week); })
      .catch(() => setError(t("leaderboard.errorLoad")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="p-8 flex items-start gap-16 max-w-7xl">
    <div className="flex-1 min-w-0 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {t("leaderboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("leaderboard.subtitle")}</p>
      </div>

      {error && (
        <div className="duo-card p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="duo-card p-12 text-center">
          <p className="text-muted-foreground animate-pulse font-semibold">
            {t("leaderboard.loading")}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4 rounded-xl bg-secondary p-1 h-auto">
            <TabsTrigger
              value="all"
              className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#ff6b00] data-[state=active]:shadow-sm"
            >
              {t("leaderboard.allTime")}
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#ff6b00] data-[state=active]:shadow-sm"
            >
              {t("leaderboard.weekly")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="duo-card overflow-hidden p-0">
              <div className="px-6 py-4 border-b-2 border-border">
                <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  {t("leaderboard.allTimeLabel")}
                </p>
              </div>
              <LeaderboardTable entries={allTime} currentUserId={currentUserId} />
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="duo-card overflow-hidden p-0">
              <div className="px-6 py-4 border-b-2 border-border">
                <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  {t("leaderboard.weeklyLabel")}
                </p>
              </div>
              <LeaderboardTable entries={weekly} currentUserId={currentUserId} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>

    {/* Mascot column */}
    <div className="hidden lg:flex flex-col items-center pt-16 shrink-0 pl-8">
      <MascotBubble image={mascotLeaderboard} message={t("mascot.leaderboard")} flip />
    </div>
  </div>
  );
}
