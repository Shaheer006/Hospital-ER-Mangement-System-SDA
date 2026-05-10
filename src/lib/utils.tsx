import { TRIAGE_COLORS, TRIAGE_LABELS } from "../constants";

export function triageBadge(level: number | string) {
  const n = Number(level);
  const safeLevel = (n >= 1 && n <= 5) ? n : 3;
  return <span className={`triage-badge ${TRIAGE_COLORS[safeLevel]}`}>T{safeLevel} — {TRIAGE_LABELS[safeLevel]}</span>;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}
