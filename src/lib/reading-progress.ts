/**
 * "Parts read" for a series, kept in this browser only (localStorage). Nothing is sent to a server.
 * Every function tolerates storage being unavailable (private windows, blocked site data).
 */

const EVENT = "reading-progress-change";

function key(seriesSlug: string): string {
  return `reading-progress:${seriesSlug}`;
}

/** The raw stored string, or "" when nothing is stored or storage is blocked. */
export function readRaw(seriesSlug: string): string {
  try {
    return window.localStorage.getItem(key(seriesSlug)) ?? "";
  } catch {
    return "";
  }
}

/** Part numbers recorded as read. */
export function parseParts(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    return Array.isArray(value)
      ? value.filter((n): n is number => Number.isInteger(n) && n > 0)
      : [];
  } catch {
    return [];
  }
}

export function markPartRead(seriesSlug: string, part: number): void {
  const parts = parseParts(readRaw(seriesSlug));
  if (parts.includes(part)) return;
  try {
    window.localStorage.setItem(
      key(seriesSlug),
      JSON.stringify([...parts, part].sort((a, b) => a - b)),
    );
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage is unavailable: progress simply is not kept.
  }
}

/** Subscribes to changes from this tab (custom event) and other tabs (storage event). */
export function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
