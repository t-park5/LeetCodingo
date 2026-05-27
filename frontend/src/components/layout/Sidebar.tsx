import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, PlusCircle, BarChart2, Trophy, UserCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { usersService } from "@/services/users";
import type { User } from "@/types";

const LANGUAGES = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/add", label: t("nav.addProblem"), icon: PlusCircle },
    { to: "/progress", label: t("nav.myProgress"), icon: BarChart2 },
    { to: "/leaderboard", label: t("nav.leaderboard"), icon: Trophy },
  ];

  useEffect(() => {
    const savedId = localStorage.getItem("selectedUserId");
    if (savedId) {
      usersService.getById(Number(savedId))
        .then(setCurrentUser)
        .catch(() => localStorage.removeItem("selectedUserId"));
    }

    function onUserSelected(e: Event) {
      setCurrentUser((e as CustomEvent).detail);
    }
    window.addEventListener("userSelected", onUserSelected);
    return () => window.removeEventListener("userSelected", onUserSelected);
  }, []);

  function changeLanguage(code: string) {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

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

      {/* Language switcher */}
      <div className="px-4 pb-2 relative">
        <button
          onClick={() => setShowLangMenu((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Globe size={16} />
          <span>{currentLang.flag} {currentLang.label}</span>
        </button>

        {showLangMenu && (
          <div className="absolute bottom-12 left-4 right-4 bg-white border-2 border-border rounded-2xl shadow-lg overflow-hidden z-10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                  i18n.language === lang.code
                    ? "bg-[#fff3e0] text-[#ff6b00]"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
            {t("dashboard.selectUser")}
          </NavLink>
        )}
      </div>
    </aside>
  );
}
