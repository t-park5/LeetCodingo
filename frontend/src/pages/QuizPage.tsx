import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Brain, ChevronRight, CheckCircle2, XCircle, ArrowLeft, Trophy,
  Lock, Map as MapIcon, Zap, BookMarked, Star,
} from "lucide-react";
import { quizService } from "@/services/quiz";
import { authService } from "@/services/auth";
import MascotBubble from "@/components/MascotBubble";
import mascotQuiz from "@/assets/mascot_dashboard.png";
import type { QuizChapter, QuizQuestion, WrongAnswerItem, SubmitLessonResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "path" | "quickmode" | "review";
type QuizState = "select" | "playing" | "result";

type PlayMode =
  | { kind: "chapter"; chapter: QuizChapter }
  | { kind: "quickmode"; questionType: string; label: string; emoji: string }
  | { kind: "review"; wrongs: WrongAnswerItem[] };

const QUESTION_TYPE_ICONS: Record<string, string> = {
  FillBlank: "✏️",
  FindBug: "🐛",
  PredictOutput: "💻",
};

const QUICK_MODES = [
  { questionType: "FindBug",       label: "Find the Bug",       emoji: "🐞", available: true },
  { questionType: "FillBlank",     label: "Fill the Blank",     emoji: "🧩", available: true },
  { questionType: "PredictOutput", label: "Predict the Output", emoji: "🔮", available: true },
  { questionType: "ArrangeCode",   label: "Arrange the Code",   emoji: "🧱", available: false },
  { questionType: "EdgeCase",      label: "Find the Edge Case", emoji: "🧪", available: false },
  { questionType: "Complexity",    label: "Complexity Challenge", emoji: "⏱", available: false },
];

// ─── QuizPage ─────────────────────────────────────────────────────────────────
export function QuizPage() {
  const { t } = useTranslation();
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id ?? 0;

  // Tab & chapter state
  const [tab, setTab] = useState<Tab>("path");
  const [chapters, setChapters] = useState<QuizChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [errorChapters, setErrorChapters] = useState("");

  // Wrong-answer review state
  const [wrongs, setWrongs] = useState<WrongAnswerItem[]>([]);
  const [loadingWrongs, setLoadingWrongs] = useState(false);

  // Active quiz session
  const [quizState, setQuizState] = useState<QuizState>("select");
  const [playMode, setPlayMode] = useState<PlayMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitLessonResponse | null>(null);

  // Skip all remaining incomplete chapters in a unit to unlock the next unit
  async function skipUnit(unitChapters: QuizChapter[]) {
    if (!userId) return;
    const incomplete = unitChapters.filter((c) => !c.isCompleted);
    for (const chapter of incomplete) {
      await quizService.skipChapter(chapter.id, userId);
    }
    loadChapters();
  }

  // Load chapters
  const loadChapters = useCallback(() => {
    setLoadingChapters(true);
    quizService.getChapters(userId || undefined)
      .then(setChapters)
      .catch(() => setErrorChapters(t("quiz.errorLoad")))
      .finally(() => setLoadingChapters(false));
  }, [userId, t]);

  useEffect(() => { loadChapters(); }, [loadChapters]);

  // Load wrong answers when review tab is opened
  useEffect(() => {
    if (tab === "review" && userId) {
      setLoadingWrongs(true);
      quizService.getWrongAnswers(userId)
        .then(setWrongs)
        .catch(() => {})
        .finally(() => setLoadingWrongs(false));
    }
  }, [tab, userId]);

  // Start a chapter quiz
  async function startChapter(chapter: QuizChapter) {
    setLoadingQuestions(true);
    try {
      const qs = await quizService.getQuestions(chapter.id);
      beginSession({ kind: "chapter", chapter }, qs);
    } catch {
      setErrorChapters(t("quiz.errorLoad"));
    } finally {
      setLoadingQuestions(false);
    }
  }

  // Start a quick-mode quiz
  async function startQuickMode(qm: typeof QUICK_MODES[0]) {
    if (!qm.available) return;
    setLoadingQuestions(true);
    try {
      const qs = await quizService.getQuestionsByType(qm.questionType, 10);
      if (qs.length === 0) {
        alert("No questions available for this mode yet.");
        setLoadingQuestions(false);
        return;
      }
      beginSession({ kind: "quickmode", questionType: qm.questionType, label: qm.label, emoji: qm.emoji }, qs);
    } catch {
      setErrorChapters(t("quiz.errorLoad"));
    } finally {
      setLoadingQuestions(false);
    }
  }

  // Start review session with wrong answers
  function startReview() {
    if (wrongs.length === 0) return;
    const qs = wrongs.map((w) => w.question);
    beginSession({ kind: "review", wrongs }, qs);
  }

  function beginSession(mode: PlayMode, qs: QuizQuestion[]) {
    setPlayMode(mode);
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setWrongIds([]);
    setSelectedAnswer(null);
    setChecked(false);
    setSubmitResult(null);
    setQuizState("playing");
  }

  function handleCheck() {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
    setChecked(true);
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongIds((ids) => [...ids, questions[currentIndex].id]);
    }
  }

  async function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      // Finished — submit if it was a chapter
      if (playMode?.kind === "chapter" && userId) {
        try {
          const res = await quizService.submitLesson({
            userId,
            chapterId: playMode.chapter.id,
            score,
            totalQuestions: questions.length,
            wrongQuestionIds: wrongIds,
          });
          setSubmitResult(res);
          loadChapters(); // refresh progress
        } catch {
          // submit failed silently — still show result
        }
      }

      // If review mode — resolve correctly answered wrongs
      if (playMode?.kind === "review" && userId) {
        const correctQuestionIds = questions
          .filter((_, idx) => !wrongIds.includes(questions[idx].id))
          .map((q) => q.id);
        const resolveIds = playMode.wrongs
          .filter((w) => correctQuestionIds.includes(w.question.id))
          .map((w) => w.wrongAnswerId);
        for (const id of resolveIds) {
          quizService.resolveWrongAnswer(id).catch(() => {});
        }
      }

      setQuizState("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setChecked(false);
    }
  }

  function backToSelect() {
    setQuizState("select");
    setPlayMode(null);
    setQuestions([]);
    setSelectedAnswer(null);
    setChecked(false);
    setScore(0);
    setWrongIds([]);
    setSubmitResult(null);
    if (tab === "review" && userId) {
      setLoadingWrongs(true);
      quizService.getWrongAnswers(userId)
        .then(setWrongs)
        .catch(() => {})
        .finally(() => setLoadingWrongs(false));
    }
  }

  // ── Group chapters by unit ────────────────────────────────────────────────
  const unitGroups = chapters.reduce<Map<string, QuizChapter[]>>((acc, ch) => {
    const key = ch.unitTitle ?? "Other";
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(ch);
    return acc;
  }, new Map());

  // ── Result screen ─────────────────────────────────────────────────────────
  if (quizState === "result") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const completed = submitResult?.isCompleted ?? false;

    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] gap-6 max-w-lg mx-auto">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${completed ? "bg-green-100" : "bg-[#fff3e0]"}`}>
          {completed ? (
            <CheckCircle2 size={44} className="text-green-500" />
          ) : (
            <Trophy size={44} className="text-[#ff6b00]" />
          )}
        </div>

        <div className="text-center">
          <p className="text-4xl font-extrabold text-foreground">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground mt-1">{pct}% correct</p>

          {playMode?.kind === "chapter" && (
            <p className="text-lg font-extrabold mt-2 text-[#ff6b00]">
              {playMode.chapter.title}
            </p>
          )}
          {playMode?.kind === "quickmode" && (
            <p className="text-lg font-extrabold mt-2 text-[#ff6b00]">
              {playMode.emoji} {playMode.label}
            </p>
          )}

          {completed && (
            <div className="mt-4 duo-card p-4 bg-green-50 border-green-300 text-center">
              <p className="text-green-700 font-extrabold text-sm">🎉 Lesson Complete!</p>
              {submitResult && (
                <p className="text-xs text-green-600 mt-1">
                  Weekly progress: {submitResult.lessonsCompletedThisWeek} / {submitResult.weeklyGoal} lessons
                </p>
              )}
            </div>
          )}

          {wrongIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {wrongIds.length} wrong answer{wrongIds.length > 1 ? "s" : ""} saved for review
            </p>
          )}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => {
              if (playMode?.kind === "chapter") {
                startChapter(playMode.chapter);
              } else {
                backToSelect();
              }
            }}
            className="flex-1 py-3 rounded-xl border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm hover:bg-[#fff3e0] transition-colors"
          >
            Try Again
          </button>
          <button onClick={backToSelect} className="flex-1 duo-btn-primary py-3 text-sm">
            {t("quiz.backToChapters")}
          </button>
        </div>
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────────────────
  if (quizState === "playing" && questions.length > 0) {
    const current = questions[currentIndex];
    const isCorrect = checked && selectedAnswer === current.correctAnswer;

    return (
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={backToSelect}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            <ArrowLeft size={16} />
            {t("quiz.backToChapters")}
          </button>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm font-bold text-foreground">
            {playMode?.kind === "chapter" && playMode.chapter.title}
            {playMode?.kind === "quickmode" && `${playMode.emoji} ${playMode.label}`}
            {playMode?.kind === "review" && "📝 Review"}
          </span>
          <span className="ml-auto text-sm font-bold text-[#ff6b00]">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-[#ff6b00] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Score */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#ff6b00]">
            <Star size={14} className="fill-[#ff6b00]" />
            {score} correct
          </div>
        </div>

        {/* Question card */}
        <div className="duo-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{QUESTION_TYPE_ICONS[current.questionType] ?? "❓"}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {current.questionType === "FillBlank" ? t("quiz.fillBlank")
                : current.questionType === "FindBug" ? t("quiz.findBug")
                : t("quiz.predictOutput")}
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

          <div className="grid gap-3">
            {current.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === current.correctAnswer;
              let style = "border-border bg-white hover:border-[#ff6b00] hover:bg-[#fff3e0]";
              if (checked) {
                if (isCorrectOption) style = "border-green-400 bg-green-50";
                else if (isSelected) style = "border-red-400 bg-red-50";
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

  // ── Selection screen ──────────────────────────────────────────────────────
  return (
    <div className="p-8 flex items-start gap-10 max-w-6xl">
      <div className="flex-1 min-w-0">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-[#ff6b00]" />
            {t("quiz.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("quiz.subtitle")}</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {([
            { id: "path",      label: "Learning Path", icon: <MapIcon size={14} /> },
            { id: "quickmode", label: "Quick Mode",    icon: <Zap size={14} /> },
            { id: "review",    label: "Review",        icon: <BookMarked size={14} /> },
          ] as const).map((t2) => (
            <button
              key={t2.id}
              onClick={() => setTab(t2.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t2.id
                  ? "bg-white shadow text-[#ff6b00]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t2.icon}
              {t2.label}
              {t2.id === "review" && wrongs.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                  {wrongs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── LEARNING PATH TAB ── */}
        {tab === "path" && (
          <div>
            {loadingChapters && (
              <p className="text-muted-foreground animate-pulse font-semibold">{t("quiz.loading")}</p>
            )}
            {errorChapters && (
              <p className="text-destructive font-bold">{errorChapters}</p>
            )}
            {!loadingChapters && chapters.length === 0 && !errorChapters && (
              <div className="duo-card p-8 text-center">
                <p className="text-4xl mb-3">🦉</p>
                <p className="font-extrabold text-lg">No chapters yet</p>
              </div>
            )}

            <div className="space-y-8">
              {Array.from(unitGroups.entries()).map(([unitTitle, unitChapters], unitIndex) => {
                const allDone = unitChapters.every((c) => c.isCompleted);
                const unitKeys = Array.from(unitGroups.keys());
                const hasNextUnit = unitIndex < unitKeys.length - 1;
                const showSkip = userId > 0 && !allDone && hasNextUnit;

                return (
                <div key={unitTitle}>
                  {/* Unit header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-sm font-extrabold text-[#ff6b00] bg-[#fff3e0] px-4 py-1 rounded-full border border-orange-200">
                      {unitTitle}
                    </span>
                    {showSkip && (
                      <button
                        onClick={() => skipUnit(unitChapters)}
                        className="text-xs font-bold text-muted-foreground border border-gray-200 px-3 py-1 rounded-full hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors"
                        title="Skip this unit and unlock the next one"
                      >
                        Skip unit →
                      </button>
                    )}
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>

                  {/* Lessons in this unit */}
                  <div className="grid gap-3">
                    {unitChapters.map((chapter) => {
                      const locked = userId > 0 && !chapter.isUnlocked;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => !locked && !loadingQuestions && startChapter(chapter)}
                          disabled={locked || loadingQuestions}
                          className={`duo-card p-5 text-left flex items-center justify-between transition-all group ${
                            locked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:border-[#ff6b00] hover:bg-[#fff3e0] cursor-pointer"
                          } ${chapter.isCompleted ? "border-green-300 bg-green-50" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Status icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              chapter.isCompleted ? "bg-green-100" : locked ? "bg-gray-100" : "bg-[#fff3e0]"
                            }`}>
                              {chapter.isCompleted ? (
                                <CheckCircle2 size={22} className="text-green-500" />
                              ) : locked ? (
                                <Lock size={18} className="text-gray-400" />
                              ) : (
                                <Brain size={20} className="text-[#ff6b00]" />
                              )}
                            </div>

                            <div>
                              <p className={`font-extrabold text-base ${
                                chapter.isCompleted ? "text-green-700"
                                  : locked ? "text-muted-foreground"
                                  : "text-foreground group-hover:text-[#ff6b00] transition-colors"
                              }`}>
                                {chapter.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">{chapter.description}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-muted-foreground font-semibold">
                                  {chapter.questionCount} {t("quiz.questions")}
                                </span>
                                {chapter.bestScore !== null && chapter.bestScore !== undefined && (
                                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    <Star size={11} className="fill-green-500 text-green-500" />
                                    Best: {chapter.bestScore}/{chapter.questionCount}
                                  </span>
                                )}
                                {locked && (
                                  <span className="text-xs text-muted-foreground font-semibold">
                                    🔒 Complete previous lesson first
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {!locked && (
                            <ChevronRight
                              size={20}
                              className="text-muted-foreground group-hover:text-[#ff6b00] transition-colors shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── QUICK MODE TAB ── */}
        {tab === "quickmode" && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              Questions are pulled from all chapters and filtered by type. Great for targeted practice.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {QUICK_MODES.map((qm) => (
                <button
                  key={qm.questionType}
                  onClick={() => startQuickMode(qm)}
                  disabled={!qm.available || loadingQuestions}
                  className={`duo-card p-6 text-left transition-all ${
                    qm.available
                      ? "hover:border-[#ff6b00] hover:bg-[#fff3e0] cursor-pointer group"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-3xl mb-3">{qm.emoji}</div>
                  <p className="font-extrabold text-base text-foreground group-hover:text-[#ff6b00] transition-colors">
                    {qm.label}
                  </p>
                  {!qm.available && (
                    <p className="text-xs text-muted-foreground mt-1 font-semibold">Coming soon</p>
                  )}
                  {qm.available && (
                    <p className="text-xs text-muted-foreground mt-1">10 random questions</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEW TAB ── */}
        {tab === "review" && (
          <div>
            {loadingWrongs && (
              <p className="text-muted-foreground animate-pulse font-semibold">Loading review items...</p>
            )}

            {!loadingWrongs && wrongs.length === 0 && (
              <div className="duo-card p-8 text-center">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-extrabold text-lg text-foreground mb-1">All caught up!</p>
                <p className="text-sm text-muted-foreground">
                  No wrong answers to review. Keep practicing!
                </p>
              </div>
            )}

            {wrongs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-red-500">{wrongs.length}</span> question{wrongs.length > 1 ? "s" : ""} waiting for review
                  </p>
                  <button
                    onClick={startReview}
                    className="duo-btn-primary px-6 py-2 text-sm flex items-center gap-2"
                  >
                    <BookMarked size={15} />
                    Start Review Session
                  </button>
                </div>

                <div className="grid gap-3">
                  {wrongs.map((item) => (
                    <div
                      key={item.wrongAnswerId}
                      className="duo-card p-4 border-red-200 bg-red-50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0">
                          {QUESTION_TYPE_ICONS[item.question.questionType] ?? "❓"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {item.question.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last missed: {new Date(item.lastAttemptedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mascot */}
      <div className="hidden lg:flex flex-col items-center pt-16 shrink-0">
        <MascotBubble image={mascotQuiz} message={t("mascot.quiz")} />
      </div>
    </div>
  );
}
