"use client";

import { useEffect, useRef, useState } from "react";
import { OPEN_SETTINGS_EVENT, getApiKey, maskKey, setApiKey, useApiKey } from "@/lib/api-key";

/** 設定視窗：全站只掛載一個（在 layout），透過 openSettings() 開啟 */
export default function SettingsDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savedKey = useApiKey();
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function open() {
      setDraft(getApiKey());
      setReveal(false);
      setSaved(false);
      dialogRef.current?.showModal();
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setApiKey(draft.trim());
    setSaved(true);
    setTimeout(close, 600);
  }

  function clear() {
    setApiKey("");
    setDraft("");
  }

  const trimmed = draft.trim();
  const looksValid = trimmed.startsWith("sk-");

  return (
    <dialog
      ref={dialogRef}
      // 點背景（dialog 本身）就關閉
      onClick={(e) => e.target === dialogRef.current && close()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={save} className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Settings</p>
            <h2 className="mt-2 font-serif text-2xl font-black">OpenAI API Key</h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="關閉"
            className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          本服務採用 BYOK（Bring Your Own Key）模式：使用你自己的 OpenAI API Key 呼叫模型，費用由你的 OpenAI 帳戶支付。
          可到{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            OpenAI 後台
          </a>{" "}
          建立一組 Key。
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="api-key" className="text-sm font-medium">
            API Key
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-paper pr-2 focus-within:border-accent">
            <input
              id="api-key"
              type={reveal ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted/60"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted hover:text-ink"
            >
              {reveal ? "隱藏" : "顯示"}
            </button>
          </div>
          {trimmed && !looksValid && (
            <p className="text-xs text-warn">OpenAI 的 API Key 通常以「sk-」開頭，請確認是否貼錯。</p>
          )}
          {savedKey && (
            <p className="text-xs text-muted">
              目前已儲存：<span className="font-mono">{maskKey(savedKey)}</span>
            </p>
          )}
        </div>

        <div className="rounded-xl bg-paper p-4 text-xs leading-relaxed text-muted">
          🔒 Key 只會儲存在這台裝置的瀏覽器（localStorage）。每次面試時會隨請求送到我們的伺服器，僅用來轉發給 OpenAI，伺服器不會保存或記錄。
          在共用電腦上使用後，建議按「清除」。
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={clear}
            disabled={!savedKey && !draft}
            className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            清除
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="rounded-full bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saved ? "已儲存 ✓" : "儲存"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
