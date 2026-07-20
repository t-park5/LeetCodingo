import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { submissionsService } from "@/services/submissions";
import { authService } from "@/services/auth";
import type { UserStats } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Flame, Trophy } from "lucide-react";
import MascotBubble from "@/components/MascotBubble";
import mascotDashboard from "@/assets/mascot_dashboard.png";

export function DashboardPage() {
  const { t } = useTranslation();
  const currentUser = authService.getCurrentUser();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (currentUser) {
      submissionsService.getStats(currentUser.id).then(setStats).catch(() => {});
    }
  }, [currentUser?.id]);

  return (
    <div className="p-8 flex items-start gap-16 max-w-6xl">
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>

        {currentUser && (
          <div className="duo-card p-5 mb-8 flex items-center justify-between bg-[#fff3e0]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold text-lg">
                {currentUser.userName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground">{currentUser.userName}</p>
                {currentUser.leetCodeUsername && (
                  <p className="text-sm text-muted-foreground">
                    LC: {currentUser.leetCodeUsername}
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-[#ff6b00] text-white font-bold px-3 py-1 rounded-full text-xs">
              {t("dashboard.currentUser")}
            </Badge>
          </div>
        )}

        {currentUser && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "totalSolved", icon: BookOpen, value: stats?.totalSolved ?? "—", color: "text-foreground" },
              { key: "thisWeek", icon: Flame, value: stats?.weeklySolved ?? "—", color: "text-[#ff6b00]" },
              { key: "totalScore", icon: Trophy, value: stats?.totalScore ?? "—", color: "text-[#ff6b00]" },
            ].map(({ key, icon: Icon, value, color }) => (
              <div key={key} className="duo-card p-5 text-center">
                <Icon size={20} className={`mx-auto mb-2 ${color}`} />
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(`dashboard.${key}`)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mascot column */}
      <div className="hidden lg:flex flex-col items-center pt-16 shrink-0 pl-8">
        <MascotBubble image={mascotDashboard} message={t("mascot.dashboard")} />
      </div>
    </div>
  );
}
