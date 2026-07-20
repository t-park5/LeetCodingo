import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Brain, ChevronRight, CheckCircle2, XCircle, ArrowLeft, Trophy } from "lucide-react";
import { quizService } from "@/services/quiz";
import MascotBubble from "@/components/MascotBubble";
import mascotQuiz from "@/assets/mascot_dashboard.png";
import type { QuizChapter, QuizQuestion } from "@/types";

const QUESTION_TYPE_ICONS: Record<string, string> = {
  FillBlank: "✏️",
  FindBug: "🐛",
  PredictOutput: "💻",
};

type QuizState = "chapters" | "playing" | "result";

export function QuizPage() {
  const { t } = useTranslation();

  const [chapters, setChapters] = useState<QuizChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [errorChapters, setErrorChapters] = useState("");

  const [activeChapter, setActiveChapter] = useState<QuizChapter | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [quizState, setQuizState] = useState<QuizState>("chapters");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    quizService.getChapters()
      .then(setChapters)
      .catch(() => setErrorChapters(t("quiz.errorLoad")))
      .finally(() => setLoadingChapters(false));
  }, [t]);

  async function startChapter(chapter: QuizChapter) {
    setLoadingQuestions(true);
    setActiveChapter(chapter);
    try {
      const qs = await quizService.getQuestions(chapter.id);
      setQuestions(qs);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setChecked(false);
      setQuizState("playing");
    } catch {
      setErrorChapters(t("quiz.errorLoad"));
    } finally {
      setLoadingQuestions(false);
    }
  }

  function handleCheck() {
    if (!selectedAnswer) return;
    setChecked(true);
    if (selectedAnswer === questions[currentIndex].correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setQuizState("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setChecked(false);
    }
  }

  function backToChapters() {
    setQuizState("chapters");
    setActiveChapter(null);
    setQuestions([]);
    setSelectedAnswer(null);
    setChecked(false);
    setScore(0);
  }

  // ── Chapter selection screen ──
  if (quizState === "chapters") {
    return (
      <div className="p-8 flex items-start gap-16 max-w-6xl">
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Brain size={28} className="text-[#ff6b00]" />
              {t("quiz.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("quiz.subtitle")}</p>
          </div>

          {loadingChapters && (
            <p className="text-muted-foreground animate-pulse font-semibold">{t("quiz.loading")}</p>
          )}

          {errorChapters && (
            <p className="text-destructive font-bold">{errorChapters}</p>
          )}

          {!loadingChapters && chapters.length === 0 && !errorChapters && (
            <div className="duo-card p-8 text-center">
              <p className="text-4xl mb-3">🦉</p>
              <p className="font-extrabold text-lg text-foreground mb-1">No chapters yet</p>
              <p className="text-sm text-muted-foreground">Quiz content is coming soon!</p>
            </div>
          )}

          <div className="grid gap-4">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => startChapter(chapter)}
                disabled={loadingQuestions}
                className="duo-card p-5 text-left flex items-center justify-between hover:border-[#ff6b00] hover:bg-[#fff3e0] transition-all group"
              >
                <div>
                  <p className="font-extrabold text-foreground text-lg group-hover:text-[#ff6b00] transition-colors">
                    {chapter.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{chapter.description}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-semibold">
                    {chapter.questionCount} {t("quiz.questions")}
                  </p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground group-hover:text-[#ff6b00] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center pt-16 shrink-0 pl-8">
          <MascotBubble image={mascotQuiz} message={t("mascot.quiz")} />
        </div>
      </div>
    );
  }

  // ── Quiz result screen ──
  if (quizState === "result") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-[#fff3e0] flex items-center justify-center">
          <Trophy size={40} className="text-[#ff6b00]" />
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold text-foreground">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground mt-1">
            {t("quiz.result")} {pct}%
          </p>
          <p className="text-lg font-extrabold mt-2 text-[#ff6b00]">
            {activeChapter?.title}
          </p>
        </div>
        <button onClick={backToChapters} className="duo-btn-primary px-8 py-3 text-sm">
          {t("quiz.backToChapters")}
        </button>
      </div>
    );
  }

  // ── Playing screen ──
  const current = questions[currentIndex];
  const isCorrect = checked && selectedAnswer === current.correctAnswer;
  const isWrong = checked && selectedAnswer !== current.correctAnswer;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={backToChapters}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          <ArrowLeft size={16} />
          {t("quiz.backToChapters")}
        </button>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm font-bold text-foreground">{activeChapter?.title}</span>
        <span className="ml-auto text-sm font-bold text-[#ff6b00]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#ff6b00] rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="duo-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{QUESTION_TYPE_ICONS[current.questionType] ?? "❓"}</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t(`quiz.${current.questionType === "FillBlank" ? "fillBlank" : current.questionType === "FindBug" ? "findBug" : "predictOutput"}`)}
          </span>
        </div>

        <p className="text-base font-semibold text-foreground mb-4 leading-relaxed">
          {current.prompt}
        </p>

        {current.codeSnippet && (
          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-x-auto mb-4 leading-relaxed">
            {current.codeSnippet}
          </pre>
        )}

        {/* Answer options */}
        <div className="grid gap-3">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === current.correctAnswer;

            let style = "border-border bg-white hover:border-[#ff6b00] hover:bg-[#fff3e0]";
            if (checked) {
              if (isCorrectOption) style = "border-green-400 bg-green-50";
              else if (isSelected && !isCorrectOption) style = "border-red-400 bg-red-50";
              else style = "border-border bg-white opacity-60";
            } else if (isSelected) {
              style = "border-[#ff6b00] bg-[#fff3e0]";
            }

            return (
              <button
                key={option}
                onClick={() => !checked && setSelectedAnswer(option)}
                disabled={checked}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${style}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {checked && isCorrectOption && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                  {checked && isSelected && !isCorrectOption && <XCircle size={16} className="text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {checked && (
        <div className={`duo-card p-4 mb-6 ${isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          <p className={`font-extrabold text-sm mb-1 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
            {isCorrect ? `✅ ${t("quiz.correct")}` : `❌ ${t("quiz.incorrect")} — ${current.correctAnswer}`}
          </p>
          {current.explanation && (
            <p className="text-sm text-foreground mt-1">
              <span className="font-semibold">{t("quiz.explanation")}:</span> {current.explanation}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="duo-btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("quiz.checkBtn")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="duo-btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= questions.length ? t("quiz.finishBtn") : t("quiz.nextBtn")}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
