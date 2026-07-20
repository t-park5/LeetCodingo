import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userName.trim() || !password) {
      setError(t("auth.errorRequired"));
      return;
    }

    setLoading(true);
    try {
      const auth = await authService.login({ userName: userName.trim(), password });
      authService.saveSession(auth);
      window.dispatchEvent(new CustomEvent("userSelected", {
        detail: { id: auth.userId, userName: auth.userName, leetCodeUsername: auth.leetCodeUsername }
      }));
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401")) {
        setError(t("auth.errorInvalidCredentials"));
      } else {
        setError(t("auth.errorServer"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#ff6b00] tracking-tight">
            LeetCodingo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("auth.loginSubtitle")}</p>
        </div>

        <div className="duo-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#fff3e0] flex items-center justify-center">
              <LogIn size={18} className="text-[#ff6b00]" />
            </div>
            <h2 className="text-lg font-extrabold">{t("auth.loginTitle")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">{t("auth.username")}</label>
              <Input
                placeholder={t("auth.usernamePlaceholder")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="username"
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">{t("auth.password")}</label>
              <Input
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="duo-btn-primary w-full py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t("auth.loggingIn") : t("auth.loginBtn")}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-[#ff6b00] font-bold hover:underline">
            {t("auth.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
