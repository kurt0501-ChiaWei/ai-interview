"use client";

import { useSyncExternalStore } from "react";

// BYOK：使用者自己的 OpenAI API Key 只存在瀏覽器的 localStorage
const STORAGE_KEY = "ai-interview:openai-api-key";
// 同一個分頁內的變更通知（storage 事件只會在「其他」分頁觸發）
const CHANGE_EVENT = "ai-interview:api-key-change";
// 請設定視窗打開的事件，任何地方都可以 dispatch
export const OPEN_SETTINGS_EVENT = "ai-interview:open-settings";

export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // 無痕模式或瀏覽器封鎖儲存時，localStorage 可能直接丟錯
    return "";
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 存不進去就算了，這次工作階段仍可使用畫面上的值
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function openSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** 讀取目前的 API Key，並在設定變更時自動重新渲染。伺服器端渲染時一律視為空字串。 */
export function useApiKey() {
  return useSyncExternalStore(subscribe, getApiKey, () => "");
}

/** 顯示用的遮罩：sk-proj-abc…wxyz */
export function maskKey(key: string) {
  if (key.length <= 12) return "•".repeat(key.length);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}
