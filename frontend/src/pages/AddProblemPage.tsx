import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Hash, Type, BarChart2 } from "lucide-react";
import MascotBubble from "@/components/MascotBubble";
import mascotAddProblem from "@/assets/mascot_add_problem.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { problemsService } from "@/services/problems";
import { submissionsService } from "@/services/submissions";

type Difficulty = "Easy" | "Medium" | "Hard";

const DIFFICULTY_STYLES: Record<Difficulty, { badge: string; border: string }> = {
  Easy:   { badge: "bg-green-100 text-green-700",  border: "border-green-400" },
  Medium: { badge: "bg-yellow-100 text-yellow-700", border: "border-yellow-400" },
  Hard:   { badge: "bg-red-100 text-red-700",       border: "border-red-400" },
};

export function AddProblemPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [leetCodeNumber, setLeetCodeNumber] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const userId = Number(localStorage.getItem("selectedUserId"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) { setError(t("addProblem.noUser")); return; }
    if (!leetCodeNumber || isNaN(Number(leetCodeNumber))) { setError(t("addProblem.errorNumber")); return; }
    if (!title.trim()) { setError(t("addProblem.errorTitle")); return; }
    if (!difficulty) { setError(t("addProblem.errorDifficulty")); return; }

    setLoading(true);
    try {
      let problem;
      try {
        const existing = await problemsService.getAll();
        problem = existing.find((p) => p.leetCodeNumber === Number(leetCodeNumber));
      } catch { /* ignore */ }

      if (!problem) {
        problem = await problemsService.create({
          leetCodeNumber: Number(leetCodeNumber),
          title: title.trim(),
          difficulty,
        });
      }

      await submissionsService.create({
        userId,
        problemId: problem.id,
        solvedDate: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/progress"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.includes("Conflict")) {
        setError(t("addProblem.errorDuplicate"));
      } else if (msg.includes("fetch") || msg.includes("Failed")) {
        setError(t("addProblem.errorServer"));
      } else {
        setError(t("addProblem.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <p className="text-2xl font-extrabold text-foreground">{t("addProblem.successTitle")}</p>
        <p className="text-muted-foreground">{t("addProblem.successSubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex items-start gap-16 max-w-5xl">
    <div className="flex-1 min-w-0 max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {t("addProblem.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("addProblem.subtitle")}</p>
      </div>

      {!userId && (
        <div className="duo-card p-4 mb-6 bg-yellow-50 border-yellow-300">
          <p className="text-sm font-semibold text-yellow-700">
            ⚠️ {t("addProblem.noUser")}
          </p>
        </div>
      )}

      <div className="duo-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold mb-1.5">
              <Hash size={15} className="text-[#ff6b00]" />
              {t("addProblem.problemNumber")} <span className="text-[#ff6b00]">*</span>
            </label>
            <Input
              type="number"
              placeholder={t("addProblem.problemNumberPlaceholder")}
              value={leetCodeNumber}
              onChange={(e) => setLeetCodeNumber(e.target.value)}
              className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold mb-1.5">
              <Type size={15} className="text-[#ff6b00]" />
              {t("addProblem.problemTitle")} <span className="text-[#ff6b00]">*</span>
            </label>
            <Input
              placeholder={t("addProblem.problemTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-2 h-11 font-medium focus:border-[#ff6b00]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold mb-1.5">
              <BarChart2 size={15} className="text-[#ff6b00]" />
              {t("addProblem.difficulty")} <span className="text-[#ff6b00]">*</span>
            </label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as Difficulty)}
            >
              <SelectTrigger className="rounded-xl border-2 h-11 font-medium">
                <SelectValue placeholder={t("addProblem.difficultyPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                  <SelectItem key={d} value={d} className="rounded-lg font-medium">
                    <Badge className={`${DIFFICULTY_STYLES[d].badge} font-bold px-2 py-0.5 rounded-full`}>
                      {d}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {difficulty && (
            <div className={`rounded-xl border-2 ${DIFFICULTY_STYLES[difficulty].border} bg-white p-3 flex items-center gap-2`}>
              <Badge className={`${DIFFICULTY_STYLES[difficulty].badge} font-bold px-3 py-1 rounded-full`}>
                {difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t(`addProblem.scoreHint.${difficulty}`)}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive font-semibold">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !userId}
              className="duo-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t("addProblem.submitting") : t("addProblem.submitBtn")}
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-xl border-2"
            >
              {t("addProblem.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>

    {/* Mascot column */}
    <div className="hidden lg:flex flex-col items-center pt-16 shrink-0 pl-8">
      <MascotBubble image={mascotAddProblem} message={t("mascot.addProblem")} flip />
    </div>
  </div>
  );
}
