import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, BarChart2, Trophy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usersService } from "@/services/users";
import type { User } from "@/types";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add", label: "Add Problem", icon: PlusCircle },
  { to: "/progress", label: "My Progress", icon: BarChart2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Sidebar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("selectedUserId");
    if (savedId) {
      usersService.getById(Number(savedId))
        .then(setCurrentUser)
        .catch(() => localStorage.removeItem("selectedUserId"));
    }

    // Listen for same-tab user selection events
    function onUserSelected(e: Event) {
      setCurrentUser((e as CustomEvent).detail);
    }
    window.addEventListener("userSelected", onUserSelected);
    return () => window.removeEventListener("userSelected", onUserSelected);
  }, []);

  return (
    <aside className="w-[250px] shrink-0 h-screen sticky top-0 bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <span className="text-xl font-extrabold text-[#ff6b00] tracking-tight">
          LeetCodingo
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">Study Tracker</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#fff3e0] text-[#ff6b00]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Current user display */}
      <div className="px-4 py-4 border-t border-border">
        {currentUser ? (
          <NavLink to="/" className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {currentUser.userName[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">
                {currentUser.userName}
              </p>
              {currentUser.leetCodeUsername && (
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.leetCodeUsername}
                </p>
              )}
            </div>
          </NavLink>
        ) : (
          <NavLink to="/" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-[#ff6b00] transition-colors font-medium">
            <UserCircle size={18} />
            유저 선택하기
          </NavLink>
        )}
      </div>
    </aside>
  );
}
