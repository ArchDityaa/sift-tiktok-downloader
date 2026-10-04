import type { TikTokResult } from "@/lib/tiktok/types";

export interface HistoryRecord {
  id: string;
  url: string;
  title?: string;
  handle: string;
  nickname: string;
  cover?: string;
  savedAt: number;
}

const KEY = "sift-history";
const LIMIT = 40;

export function readHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToHistory(result: TikTokResult): HistoryRecord[] {
  const record: HistoryRecord = {
    id: result.id || result.url,
    url: result.url,
    title: result.title,
    handle: result.author.handle,
    nickname: result.author.nickname,
    cover: result.cover,
    savedAt: Date.now(),
  };

  const next = [
    record,
    ...readHistory().filter((item) => item.id !== record.id),
  ].slice(0, LIMIT);

  write(next);
  return next;
}

export function removeFromHistory(id: string): HistoryRecord[] {
  const next = readHistory().filter((item) => item.id !== id);
  write(next);
  return next;
}

export function clearHistory(): HistoryRecord[] {
  write([]);
  return [];
}

function write(records: HistoryRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    /* storage may be full or unavailable */
  }
}
