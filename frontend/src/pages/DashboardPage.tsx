import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usersService } from "@/services/users";
import { submissionsService } from "@/services/submissions";
import type { User, UserStats } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Trophy, BookOpen, Flame } from "lucide-react";
import MascotBubble from "@/components/MascotBubble";
import mascotDashboard from "@/assets/mascot_dashboard.png";

export function DashboardPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [leetCodeUsername, setLeetCodeUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();

    const saved = localStorage.getItem("selectedUserId");
    if (saved) {
      usersService.getById(Number(saved))
        .then((u) => {
          setSelectedUser(u);
          submissionsService.getStats(u.id).then(setStats).catch(() => {});
        })
        .catch(() => localStorage.removeItem("selectedUserId"));
    }
  }, []);

  async function loadUsers() {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch {
      // backend might not be running yet
    }
  }

  function selectUser(user: User) {
    setSelectedUser(user);
    setStats(null);
    localStorage.setItem("selectedUserId", String(user.id));
    setShowCreateForm(false);
    window.dispatchEvent(new CustomEvent("userSelected", { detail: user }));
    submissionsService.getStats(user.id).then(setStats).catch(() => {});
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim()) { setError(t("dashboard.errorNickname")); return; }

    setLoading(true);
    setError("");
    try {
      const newUser = await usersService.create({
        userName: userName.trim(),
        leetCodeUsername: leetCodeUsername.trim() || undefined,
      });
      setUsers((prev) => [...prev, newUser]);
      selectUser(newUser);
      setUserName("");
      setLeetCodeUsername("");
    } catch {
      setError(t("dashboard.errorDuplicate"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 flex items-start gap-16 max-w-6xl">
    <div className="flex-1 min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {selectedUser && (
        <div className="duo-card p-5 mb-8 flex items-center justify-between bg-[#fff3e0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold text-lg">
              {selectedUser.userName[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-foreground">{selectedUser.userName}</p>
              {selectedUser.leetCodeUsername && (
                <p className="text-sm text-muted-foreground">
                  LC: {selectedUser.leetCodeUsername}
                </p>
              )}
            </div>
          </div>
          <Badge className="bg-[#ff6b00] text-white font-bold px-3 py-1 rounded-full text-xs">
            {t("dashboard.currentUser")}
          </Badge>
        </div>
      )}

      {users.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {t("dashboard.selectUser")}
          </p>
          <div className="grid gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold transition-all flex items-center gap-3
                  ${selectedUser?.id === user.id
                    ? "border-[#ff6b00] bg-[#fff3e0] text-[#ff6b00]"
                    : "border-border bg-white hover:border-[#ff6b00]/50 hover:bg-[#fff3e0]/50 text-foreground"
                  }`}
              >
                <UserCircle size={20} />
                <span>{user.userName}</span>
                {user.leetCodeUsername && (
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {user.leetCodeUsername}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#ff6b00]/40 text-[#ff6b00] font-bold hover:bg-[#fff3e0] transition-colors text-sm"
        >
          {t("dashboard.createNew")}
        </button>
      ) : (
        <div className="duo-card p-6 mt-2">
          <p className="font-extrabold text-lg mb-5">{t("dashboard.createTitle")}</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("dashboard.nickname")}{" "}
                <span className="text-[#ff6b00]">*</span>
              </label>
              <Input
                placeholder={t("dashboard.nicknamePlaceholder")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("dashboard.leetcodeId")}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {t("dashboard.leetcodeIdNote")}
                </span>
              </label>
              <Input
                placeholder={t("dashboard.leetcodeIdPlaceholder")}
                value={leetCodeUsername}
                onChange={(e) => setLeetCodeUsername(e.target.value)}
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="duo-btn-primary flex-1 py-3 text-sm"
              >
                {loading ? t("dashboard.creating") : t("dashboard.createBtn")}
              </button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowCreateForm(false); setError(""); }}
                className="rounded-xl border-2"
              >
                {t("dashboard.cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {selectedUser && (
        <div className="grid grid-cols-3 gap-4 mt-8">
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
