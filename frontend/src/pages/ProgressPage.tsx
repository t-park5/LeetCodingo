import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Flame, BookOpen, TrendingUp } from "lucide-react";
import MascotBubble from "@/components/MascotBubble";
import mascotProgress from "@/assets/mascot_my_progress.png";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { submissionsService } from "@/services/submissions";
import type { UserStats, Submission } from "@/types";

const DIFFICULTY_CONFIG = {
  Easy:   { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", badge: "bg-green-100 text-green-700",  score: 1,  progressColor: "[&>div]:bg-green-400" },
  Medium: { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", score: 3, progressColor: "[&>div]:bg-yellow-400" },
  Hard:   { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",      score: 5,  progressColor: "[&>div]:bg-red-400" },
};

export function ProgressPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = Number(localStorage.getItem("selectedUserId"));

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([
      submissionsService.getStats(userId),
      submissionsService.getByUser(userId),
    ])
      .then(([s, subs]) => {
        setStats(s);
        setRecentSubmissions(subs.slice(0, 5));
      })
      .catch(() => setError(t("progress.errorLoad")))
      .finally(() => setLoading(false));
  }, [userId, t]);

  if (!userId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BookOpen size={48} className="text-muted-foreground" />
        <p className="text-xl font-extrabold text-foreground">{t("progress.noUser")}</p>
        <button onClick={() => navigate("/")} className="duo-btn-primary px-8 py-3 text-sm">
          {t("progress.goDashboard")}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground animate-pulse font-semibold">{t("progress.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-destructive font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="duo-btn-primary px-6 py-3 text-sm">
          {t("progress.retry")}
        </button>
      </div>
    );
  }

  const total = stats?.totalSolved ?? 0;

  return (
    <div className="p-8 flex items-start gap-16 max-w-6xl">
    <div className="flex-1 min-w-0 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {t("progress.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {stats?.userName}{t("progress.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="duo-card p-5 text-center">
          <BookOpen size={20} className="mx-auto mb-2 text-foreground" />
          <p className="text-3xl font-extrabold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.totalSolved")}</p>
        </div>
        <div className="duo-card p-5 text-center">
          <Flame size={20} className="mx-auto mb-2 text-[#ff6b00]" />
          <p className="text-3xl font-extrabold text-[#ff6b00]">{stats?.weeklySolved ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.thisWeek")}</p>
        </div>
        <div className="duo-card p-5 text-center">
          <Trophy size={20} className="mx-auto mb-2 text-[#ff6b00]" />
          <p className="text-3xl font-extrabold text-[#ff6b00]">{stats?.totalScore ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.totalScore")}</p>
        </div>
      </div>

      <div className="duo-card p-6 mb-6">
        <p className="font-extrabold text-base mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#ff6b00]" />
          {t("progress.byDifficulty")}
        </p>
        <div className="space-y-5">
          {(["Easy", "Medium", "Hard"] as const).map((d) => {
            const count = stats?.[`${d.toLowerCase()}Solved` as keyof UserStats] as number ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const cfg = DIFFICULTY_CONFIG[d];
            return (
              <div key={d}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${cfg.badge} font-bold px-3 py-0.5 rounded-full text-xs`}>
                      {d}
                    </Badge>
                    <span className={`text-sm font-bold ${cfg.color}`}>
                      {count} {t("progress.problems")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {pct}% · +{cfg.score}{t("progress.scoreEach")}
                  </span>
                </div>
                <div className={`rounded-full overflow-hidden ${cfg.progressColor}`}>
                  <Progress value={pct} className={`h-3 rounded-full bg-gray-100 ${cfg.progressColor}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {recentSubmissions.length > 0 && (
        <div className="duo-card p-6">
          <p className="font-extrabold text-base mb-4">{t("progress.recentSolved")}</p>
          <div className="space-y-2">
            {recentSubmissions.map((sub) => {
              const cfg = DIFFICULTY_CONFIG[sub.difficulty];
              return (
                <div
                  key={sub.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${cfg.border} ${cfg.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-10">
                      #{sub.leetCodeNumber}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                      {sub.problemTitle}
                    </span>
                  </div>
                  <Badge className={`${cfg.badge} font-bold px-2 py-0.5 rounded-full text-xs shrink-0`}>
                    {sub.difficulty}
                  </Badge>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate("/add")}
            className="duo-btn-primary w-full mt-4 py-3 text-sm"
          >
            {t("progress.addMore")}
          </button>
        </div>
      )}

      {total === 0 && (
        <div className="duo-card p-8 text-center">
          <p className="text-4xl mb-3">{t("progress.emptyEmoji")}</p>
          <p className="font-extrabold text-lg text-foreground mb-1">{t("progress.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mb-5">{t("progress.emptySubtitle")}</p>
          <button onClick={() => navigate("/add")} className="duo-btn-primary px-8 py-3 text-sm">
            {t("progress.addFirst")}
          </button>
        </div>
      )}
    </div>

    {/* Mascot column */}
    <div className="hidden lg:flex flex-col items-center pt-16 shrink-0 pl-8">
      <MascotBubble image={mascotProgress} message={t("mascot.progress")} />
    </div>
  </div>
  );
}
