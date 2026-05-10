import { Alert, Bed, Patient } from "../../types";
import { PAGE_META } from "../../constants";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  page: string;
  setPage: (p: string) => void;
  criticalCount: number;
  waitingCount: number;
  alerts: Alert[];
}

export function Sidebar({ collapsed, setCollapsed, page, setPage, criticalCount, waitingCount, alerts }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">ER</div>
        {!collapsed && <div className="logo-text">ER Triage<br /><span className="logo-sub">Hospital System</span></div>}
      </div>
      <nav className="sidebar-nav">
        {Object.entries(PAGE_META).map(([key, m]) => (
          <div key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => setPage(key)}>
            <span className="nav-icon">{m.icon}</span>
            {!collapsed && <>
              <span style={{ flex: 1 }}>{m.label}</span>
              {key === "floor" && criticalCount > 0 && <span className="nav-badge">{criticalCount}</span>}
              {key === "admissions" && waitingCount > 0 && <span className="nav-badge" style={{ background: "var(--amber)" }}>{waitingCount}</span>}
            </>}
          </div>
        ))}
      </nav>

      {/* Notification Log (Observer output) */}
      {!collapsed && (
        <div className="alert-panel">
          <div className="alert-panel-title">⬤ Notification Log</div>
          {[...alerts].reverse().slice(0, 8).map((a, i) => (
            <div key={i} className={`alert-entry ${a.type}`}>
              <div className="alert-time">{a.ts.toLocaleTimeString()}</div>
              <div>{a.text}</div>
            </div>
          ))}
        </div>
      )}

      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "▶" : "◀"}</button>
    </aside>
  );
}
