import { TRIAGE_COLORS, TRIAGE_LABELS } from "../constants";

export function triageBadge(level: number) {
  return <span className={`triage-badge ${TRIAGE_COLORS[level]}`}>T{level} — {TRIAGE_LABELS[level]}</span>;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m/60)}h ${m%60}m ago`;
}
