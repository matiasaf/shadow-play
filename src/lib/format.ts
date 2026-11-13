// Small presentational helpers for the noir "case file" chrome.

/** A film's runtime shown as a reel timecode: 170 min -> "02:50:00". */
export function runtimeTimecode(minutes?: number): string {
  if (!minutes || minutes <= 0) return '––:––:––';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** Archive case number: 3 -> "Nº003". */
export function caseNo(n: number): string {
  return `Nº${String(n).padStart(3, '0')}`;
}

/** Minutes to read a Markdown body at ~220 words per minute, at least 1. */
export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/[#>*_`\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
