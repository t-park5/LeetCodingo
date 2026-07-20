import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy, Flame, BookOpen, TrendingUp, Tag, RefreshCw,
  CheckCircle2, Brain, Target, Zap, CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MascotBubble from "@/components/MascotBubble";
import mascotDashboard from "@/assets/mascot_dashboard.png";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ActivityCalendar } from "@/components/ActivityCalendar";
import { submissionsService } from "@/services/submissions";
import { leetcodeService } from "@/services/leetcode";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";
import { quizService } from "@/services/quiz";
import type { UserStats, Submission, TagStat } from "@/types";

const DIFFICULTY_CONFIG = {
  Easy:   { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", badge: "bg-green-100 text-green-700",  score: 1,  progressColor: "[&>div]:bg-green-400" },
  Medium: { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", score: 3, progressColor: "[&>div]:bg-yellow-400" },
  Hard:   { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",      score: 5,  progressColor: "[&>div]:bg-red-400" },
};

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
];

const GOAL_OPTIONS = [
  { value: 3, label: "Casual", emoji: "☕" },
  { value: 5, label: "Regular", emoji: "🔥" },
  { value: 10, label: "Serious", emoji: "⚡" },
];

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id ?? 0;

  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const [streak, setStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [lessonsThisWeek, setLessonsThisWeek] = useState(0);
  const [updatingGoal, setUpdatingGoal] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    Promise.all([
      submissionsService.getStats(userId),
      submissionsService.getByUser(userId),
      leetcodeService.getTagStats(userId),
      usersService.checkIn(userId),
      usersService.getById(userId),
      quizService.getChapters(userId),
      submissionsService.getActivity(userId),
    ])
      .then(([s, subs, tags, checkin, user, chapters, act]) => {
        setStats(s);
        setRecentSubmissions(subs.slice(0, 5));
        setTagStats(tags);
        setStreak(checkin.currentStreak);
        setWeeklyGoal(user.weeklyGoalLessons);
        const completed = chapters.filter((c) => c.isCompleted).length;
        setLessonsThisWeek(completed);
        setActivity(act);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleSync() {
    if (!currentUser?.leetCodeUsername) return;
    setSyncing(true);
    setSyncMessage("");
    try {
      const result = await leetcodeService.sync(userId);
      setSyncMessage(result.message);
      const [s, subs, tags, act] = await Promise.all([
        submissionsService.getStats(userId),
        submissionsService.getByUser(userId),
        leetcodeService.getTagStats(userId),
        submissionsService.getActivity(userId),
      ]);
      setStats(s);
      setRecentSubmissions(subs.slice(0, 5));
      setTagStats(tags);
      setActivity(act);
    } catch {
      setSyncMessage(t("sync.errorSync"));
    } finally {
      setSyncing(false);
    }
  }

  async function handleGoalChange(goal: number) {
    if (!userId || goal === weeklyGoal) return;
    setUpdatingGoal(true);
    try {
      const result = await usersService.updateGoal(userId, goal);
      setWeeklyGoal(result.goalLessons);
      setLessonsThisWeek(result.completedThisWeek);
    } catch {
      // silent
    } finally {
      setUpdatingGoal(false);
    }
  }

  const total = stats?.totalSolved ?? 0;
  const maxTagCount = tagStats[0]?.count ?? 1;
  const goalProgress = weeklyGoal > 0 ? Math.min(100, Math.round((lessonsThisWeek / weeklyGoal) * 100)) : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground animate-pulse font-semibold">{t("progress.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex items-start gap-10 max-w-7xl">
      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentUser
                ? `${currentUser.userName} · ${t("dashboard.subtitle")}`
                : t("dashboard.subtitle")}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {currentUser?.leetCodeUsername ? (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#ff6b00] text-[#ff6b00] text-sm font-bold hover:bg-[#fff3e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                {syncing ? t("sync.syncing") : t("sync.syncBtn")}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground max-w-[180px] text-right leading-relaxed">
                {t("sync.noLeetCodeId")}
              </p>
            )}
            {syncMessage && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                <CheckCircle2 size={12} />
                {syncMessage}
              </div>
            )}
          </div>
        </div>

        {/* Stats row — now includes streak */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
          {/* Daily Streak */}
          <div className="duo-card p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent pointer-events-none" />
            <Zap size={20} className="mx-auto mb-2 text-[#ff6b00]" />
            <p className="text-3xl font-extrabold text-[#ff6b00]">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">day streak 🔥</p>
          </div>
        </div>

        {/* Weekly Goal + Difficulty row */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Weekly Goal */}
          <div className="duo-card p-6">
            <p className="font-extrabold text-base mb-4 flex items-center gap-2">
              <Target size={18} className="text-[#ff6b00]" />
              Weekly Goal
            </p>

            {/* Goal selector */}
            <div className="flex gap-2 mb-5">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleGoalChange(opt.value)}
                  disabled={updatingGoal}
                  className={`flex-1 py-2 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    weeklyGoal === opt.value
                      ? "border-[#ff6b00] bg-[#fff3e0] text-[#ff6b00]"
                      : "border-gray-200 text-muted-foreground hover:border-gray-300"
                  }`}
                >
                  <span className="block text-base mb-0.5">{opt.emoji}</span>
                  {opt.label}
                  <span className="block font-normal opacity-70">{opt.value} lessons</span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>This week</span>
                <span className="text-[#ff6b00]">{lessonsThisWeek} / {weeklyGoal} lessons</span>
              </div>
              <Progress
                value={goalProgress}
                className="h-4 rounded-full bg-gray-100 [&>div]:bg-[#ff6b00]"
              />
              {goalProgress >= 100 && (
                <p className="text-xs text-green-600 font-bold text-center animate-bounce">
                  🎉 Goal reached! Amazing work!
                </p>
              )}
            </div>
          </div>

          {/* By Difficulty */}
          <div className="duo-card p-6">
            <p className="font-extrabold text-base mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#ff6b00]" />
              {t("progress.byDifficulty")}
            </p>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.noProblemsSolved")}</p>
            ) : (
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
                          +{cfg.score}{t("progress.scoreEach")}
                        </span>
                      </div>
                      <Progress value={pct} className={`h-3 rounded-full bg-gray-100 ${cfg.progressColor}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Topic Tags */}
        <div className="duo-card p-6 mb-6">
          <p className="font-extrabold text-base mb-4 flex items-center gap-2">
            <Tag size={18} className="text-[#ff6b00]" />
            {t("sync.tagBreakdownTitle")}
          </p>
          {tagStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("sync.noTags")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {tagStats.slice(0, 10).map((tag, i) => {
                const pct = Math.round((tag.count / maxTagCount) * 100);
                const colorClass = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <div key={tag.tagName} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 w-28 text-center ${colorClass}`}>
                      {tag.tagName}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#ff6b00] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground w-6 text-right shrink-0">
                      {tag.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Calendar */}
        <div className="duo-card p-6 mb-6">
          <p className="font-extrabold text-base mb-5 flex items-center gap-2">
            <CalendarDays size={18} className="text-[#ff6b00]" />
            Solve Activity
          </p>
          <ActivityCalendar activity={activity} />
        </div>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
          <div className="duo-card p-6 mb-6">
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
                      <span className="text-sm font-semibold text-foreground truncate max-w-[220px]">
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
          </div>
        )}

        {/* Empty state */}
        {total === 0 && !loading && (
          <div className="duo-card p-8 text-center">
            <p className="text-4xl mb-3">🦉</p>
            <p className="font-extrabold text-lg text-foreground mb-1">{t("progress.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground mb-5">{t("progress.emptySubtitle")}</p>
            <button
              onClick={() => navigate("/quiz")}
              className="duo-btn-primary px-8 py-3 text-sm flex items-center gap-2 mx-auto"
            >
              <Brain size={16} />
              {t("nav.quiz")}
            </button>
          </div>
        )}
      </div>

      {/* Mascot */}
      <div className="hidden lg:flex flex-col items-center pt-16 shrink-0">
        <MascotBubble image={mascotDashboard} message={t("mascot.dashboard")} />
      </div>
    </div>
  );
}
