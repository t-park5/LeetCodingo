import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [leetCodeUsername, setLeetCodeUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userName.trim()) { setError(t("auth.errorRequiredUsername")); return; }
    if (!password || password.length < 6) { setError(t("auth.errorPasswordLength")); return; }

    setLoading(true);
    try {
      const auth = await authService.register({
        userName: userName.trim(),
        password,
        email: email.trim() || undefined,
        leetCodeUsername: leetCodeUsername.trim() || undefined,
      });
      authService.saveSession(auth);
      window.dispatchEvent(new CustomEvent("userSelected", {
        detail: { id: auth.userId, userName: auth.userName, leetCodeUsername: auth.leetCodeUsername }
      }));
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.includes("Conflict")) {
        setError(t("auth.errorUsernameTaken"));
      } else if (msg.includes("400")) {
        setError(t("auth.errorBadRequest"));
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
          <p className="text-sm text-muted-foreground mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <div className="duo-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#fff3e0] flex items-center justify-center">
              <UserPlus size={18} className="text-[#ff6b00]" />
            </div>
            <h2 className="text-lg font-extrabold">{t("auth.registerTitle")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("auth.username")} <span className="text-[#ff6b00]">*</span>
              </label>
              <Input
                placeholder={t("auth.usernamePlaceholder")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="username"
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("auth.password")} <span className="text-[#ff6b00]">*</span>
              </label>
              <Input
                type="password"
                placeholder={t("auth.passwordRegisterPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("auth.email")}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {t("auth.optional")}
                </span>
              </label>
              <Input
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5">
                {t("dashboard.leetcodeId")}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {t("auth.optional")}
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
              <p className="text-sm text-destructive font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="duo-btn-primary w-full py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t("auth.registering") : t("auth.registerBtn")}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="text-[#ff6b00] font-bold hover:underline">
            {t("auth.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
