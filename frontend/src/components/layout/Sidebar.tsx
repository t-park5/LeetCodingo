import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, BarChart2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add", label: "Add Problem", icon: PlusCircle },
  { to: "/progress", label: "My Progress", icon: BarChart2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Sidebar() {
  return (
    <aside className="w-[250px] shrink-0 h-screen sticky top-0 bg-white border-r border-border flex flex-col">
      <div className="px-6 py-6 border-b border-border">
        <span className="text-xl font-bold text-[#ff6b00]">LeetCodingo</span>
        <p className="text-xs text-muted-foreground mt-1">Study Tracker</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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

      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">Mini Project MVP</p>
      </div>
    </aside>
  );
}
