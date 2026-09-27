"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type ChatMessage,
  type Evaluation,
  type InterviewResponse,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "done";

const QUICK_COUNTS = [3, 5, 8];

function clampCount(n: number) {
  return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.round(n) || DEFAULT_QUESTIONS));
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  return (
    <div className="relative grid size-36 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="text-center">
        <div className="font-serif text-4xl font-black text-ink">{score}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">/ 100</div>
      </div>
    </div>
  );
}

export default function InterviewApp() {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const validQuestionCount =
    Number.isInteger(totalQuestions) && totalQuestions >= MIN_QUESTIONS && totalQuestions <= MAX_QUESTIONS;

  useEffect(() => {
    if (stage !== "setup") bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [stage, messages, loading, evaluation]);

  async function callInterview(history: ChatMessage[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, totalQuestions, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");

      const result = data as InterviewResponse;
      if (result.type === "question") {
        setMessages([...history, { role: "interviewer", content: result.content }]);
        setQuestionNumber(result.questionNumber);
      } else {
        setMessages(history);
        setEvaluation(result.evaluation);
        setStage("done");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    if (!jobDescription.trim() || !validQuestionCount) return;
    setStage("interview");
    const ok = await callInterview([]);
    if (!ok) setStage("setup");
  }

  async function submitAnswer() {
    const text = answer.trim();
    if (!text || loading) return;
    const history: ChatMessage[] = [...messages, { role: "candidate", content: text }];
    setMessages(history);
    setAnswer("");
    const ok = await callInterview(history);
    if (!ok) {
      // Roll back so the user can retry with their answer intact
      setMessages(messages);
      setAnswer(text);
    }
  }

  function reset() {
    setStage("setup");
    setMessages([]);
    setQuestionNumber(0);
    setAnswer("");
    setEvaluation(null);
    setError("");
  }

  const answered = messages.filter((m) => m.role === "candidate").length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      {/* ───────── 頁首：標題 + 進度 ───────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {stage === "setup" ? "Step 1 · Setup" : stage === "interview" ? "Step 2 · Interview" : "Step 3 · Report"}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">
            {stage === "setup" ? "準備你的模擬面試" : stage === "interview" ? "面試進行中" : "你的面試報告"}
          </h1>
        </div>
        {stage !== "setup" && (
          <button
            onClick={reset}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
          >
            重新開始
          </button>
        )}
      </div>

      {stage !== "setup" && (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < answered ? "bg-accent" : i < questionNumber ? "bg-accent/40" : "bg-line"
                }`}
              />
            ))}
          </div>
          <span className="shrink-0 font-mono text-xs text-muted">
            {stage === "done" ? "完成" : `${questionNumber || 1} / ${totalQuestions}`}
          </span>
        </div>
      )}

      {/* ───────── Step 1：設定 ───────── */}
      {stage === "setup" && (
        <section className="animate-rise flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="jd" className="font-medium">
              職缺描述
            </label>
            <p className="text-sm text-muted">越完整越好：工作內容、必備技能、加分條件都貼進來。</p>
            <textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="例如：資深前端工程師，熟悉 React、Next.js、TypeScript，具備效能優化經驗……"
              className="mt-1 resize-y rounded-xl border border-line bg-paper p-4 leading-relaxed text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-medium">題數</span>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTotalQuestions(n)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    totalQuestions === n
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink/80 hover:border-ink"
                  }`}
                >
                  {n} 題
                </button>
              ))}
              <label className="flex items-center gap-2 text-sm text-muted">
                或自訂
                <input
                  type="number"
                  min={MIN_QUESTIONS}
                  max={MAX_QUESTIONS}
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  onBlur={() => setTotalQuestions(clampCount)}
                  className="w-16 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-center text-ink outline-none focus:border-accent"
                />
                <span>
                  （{MIN_QUESTIONS}–{MAX_QUESTIONS}）
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">面試內容只會送往 OpenAI 產生題目與評分，不會被保存。</p>
            <button
              onClick={start}
              disabled={!jobDescription.trim() || loading || !validQuestionCount}
              className="rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "準備中…" : "開始面試 →"}
            </button>
          </div>
        </section>
      )}

      {/* ───────── Step 2：對話 ───────── */}
      {stage !== "setup" && (
        <section className="flex flex-col gap-4">
          {messages.map((m, i) =>
            m.role === "interviewer" ? (
              <div key={i} className="animate-rise flex gap-3">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-ink font-serif text-xs font-black text-paper">
                  AI
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-surface px-5 py-4 leading-relaxed whitespace-pre-wrap shadow-sm">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="animate-rise flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-5 py-4 leading-relaxed whitespace-pre-wrap text-paper">
                  {m.content}
                </div>
              </div>
            ),
          )}
          {loading && (
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-serif text-xs font-black text-paper">
                AI
              </span>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-surface px-5 py-4 text-sm text-muted">
                <span className="flex gap-1">
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.2s]" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.4s]" />
                </span>
                {answered === totalQuestions ? "面試官正在撰寫報告…" : "面試官思考中…"}
              </div>
            </div>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">{error}</p>
      )}

      {stage === "interview" && questionNumber > 0 && (
        <section className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-lg shadow-ink/5 backdrop-blur">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitAnswer();
            }}
            rows={4}
            disabled={loading}
            placeholder="輸入你的回答……"
            className="resize-y rounded-xl bg-transparent px-3 py-2 leading-relaxed text-ink outline-none placeholder:text-muted/60 disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3 px-2">
            <span className="hidden font-mono text-[11px] text-muted sm:inline">Ctrl + Enter 送出</span>
            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || loading}
              className="ml-auto rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              送出回答
            </button>
          </div>
        </section>
      )}

      {/* ───────── Step 3：報告 ───────── */}
      {stage === "done" && evaluation && (
        <section className="animate-rise flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={evaluation.score} />
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">整體評語</p>
              <p className="mt-2 leading-relaxed">{evaluation.summary}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-good-soft p-5">
              <h2 className="mb-3 text-sm font-bold text-good">優點</h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-good">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-accent-soft p-5">
              <h2 className="mb-3 text-sm font-bold text-accent">改進建議</h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {stage === "done" && evaluation && evaluation.questionReviews.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="font-serif text-2xl font-black">逐題檢討</h2>
          {evaluation.questionReviews.map((r, i) => (
            <article key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <header className="flex gap-4 border-b border-line p-6">
                <span className="font-serif text-3xl leading-none font-black text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="leading-relaxed font-medium whitespace-pre-wrap">{r.question}</p>
              </header>
              <div className="flex flex-col gap-4 p-6">
                <div>
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted">你的回答</p>
                  <p className="leading-relaxed whitespace-pre-wrap text-ink/70">{r.answer}</p>
                </div>
                {r.feedback && (
                  <div>
                    <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-warn">回饋</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{r.feedback}</p>
                  </div>
                )}
                {r.betterAnswer && (
                  <div className="rounded-xl border border-good/30 bg-good-soft p-5">
                    <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-good">建議回答方式</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{r.betterAnswer}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
          <button
            onClick={reset}
            className="self-center rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent hover:text-white"
          >
            再練一場
          </button>
        </section>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
