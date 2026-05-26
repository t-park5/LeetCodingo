import { useEffect, useState } from "react";
import { usersService } from "@/services/users";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Trophy, BookOpen, Flame } from "lucide-react";

export function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
        .then(setSelectedUser)
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
    localStorage.setItem("selectedUserId", String(user.id));
    setShowCreateForm(false);
    // Notify Sidebar in the same tab
    window.dispatchEvent(new CustomEvent("userSelected", { detail: user }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim()) { setError("닉네임을 입력해 주세요."); return; }

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
      setError("이미 사용 중인 닉네임이거나 서버 오류입니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          LeetCodingo 🦎
        </h1>
        <p className="text-muted-foreground mt-1">
          LeetCode 학습을 함께 트래킹해요
        </p>
      </div>

      {/* Active user banner */}
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
            현재 유저
          </Badge>
        </div>
      )}

      {/* User list */}
      {users.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            유저 선택
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

      {/* Create user toggle */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#ff6b00]/40 text-[#ff6b00] font-bold hover:bg-[#fff3e0] transition-colors text-sm"
        >
          + 새 유저 만들기
        </button>
      ) : (
        /* Create user form */
        <div className="duo-card p-6 mt-2">
          <p className="font-extrabold text-lg mb-5">새 프로필 만들기</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">
                닉네임 <span className="text-[#ff6b00]">*</span>
              </label>
              <Input
                placeholder="예: leetcoder123"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5">
                LeetCode 아이디
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (나중에 프로필 연동에 사용)
                </span>
              </label>
              <Input
                placeholder="예: john_doe"
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
                {loading ? "생성 중..." : "프로필 만들기"}
              </button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowCreateForm(false); setError(""); }}
                className="rounded-xl border-2"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quick stats placeholder */}
      {selectedUser && (
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: "총 풀이", icon: BookOpen, value: "—", color: "text-foreground" },
            { label: "이번 주", icon: Flame, value: "—", color: "text-[#ff6b00]" },
            { label: "총 점수", icon: Trophy, value: "—", color: "text-[#ff6b00]" },
          ].map(({ label, icon: Icon, value, color }) => (
            <div key={label} className="duo-card p-5 text-center">
              <Icon size={20} className={`mx-auto mb-2 ${color}`} />
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
