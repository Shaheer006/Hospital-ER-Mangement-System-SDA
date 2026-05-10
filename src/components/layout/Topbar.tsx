interface TopbarProps {
  label: string;
  sub: string;
  erStatus: string;
  erStatusLabel: string;
}

export function Topbar({ label, sub, erStatus, erStatusLabel }: TopbarProps) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{label}</div>
        <div className="topbar-sub">{sub}</div>
      </div>
      <div className="topbar-spacer" />
      <div className={`status-pill ${erStatus}`}>
        <div className="pulse" />
        {erStatusLabel}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}
