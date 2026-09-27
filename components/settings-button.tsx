"use client";

import { openSettings, useApiKey } from "@/lib/api-key";

export default function SettingsButton() {
  const apiKey = useApiKey();

  return (
    <button
      type="button"
      onClick={openSettings}
      aria-label="設定 OpenAI API Key"
      title={apiKey ? "API Key 已設定" : "尚未設定 API Key"}
      className="relative grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          strokeLinejoin="round"
        />
      </svg>
      {/* 狀態小圓點：綠色 = 已設定，朱紅 = 未設定 */}
      <span
        className={`absolute top-0.5 right-0.5 size-2 rounded-full ring-2 ring-paper ${apiKey ? "bg-good" : "bg-accent"}`}
      />
    </button>
  );
}
