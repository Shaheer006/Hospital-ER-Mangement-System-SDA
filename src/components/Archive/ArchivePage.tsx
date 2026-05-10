import { ArchiveRecord } from "../../types";
import { EQUIPMENT_CATALOG } from "../../constants";
import { triageBadge } from "../../lib/utils";

interface ArchivePageProps {
  archive: ArchiveRecord[];
}

export function ArchivePage({ archive }: ArchivePageProps) {
  // THE FIX: Absolute guarantee archive is an array before we do math on it.
  const safeArchive = Array.isArray(archive) ? archive : [];

  // THE FIX: Checks both 'billing' and 'totalBilledAmount' depending on what the DB sent
  const totalBilling = safeArchive.reduce((sum, r: any) => sum + (Number(r.billing || r.totalBilledAmount) || 0), 0);
  const avgBilling = safeArchive.length ? Math.round(totalBilling / safeArchive.length) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Total Records</div>
          <div className="card-value accent">{safeArchive.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Total Billed</div>
          <div className="card-value green">${totalBilling.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Avg Bill / Patient</div>
          <div className="card-value amber">${avgBilling.toLocaleString()}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Express Admits</div>
          <div className="card-value red">{safeArchive.filter(r => r.type === "express").length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Sex</th>
                <th>Complaint</th>
                <th>Triage</th>
                <th>Admitted</th>
                <th>Discharged</th>
                <th>Equipment Used</th>
                <th>Total Bill</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {safeArchive.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No archived records yet</td></tr>
              )}
              {[...safeArchive].reverse().map((r: any, i) => {
                // THE FIX: Safely parse decorators even if it's missing or a weird string
                let decs = [];
                if (Array.isArray(r.decorators)) decs = r.decorators;
                else if (typeof r.decorators === 'string') {
                  try { decs = JSON.parse(r.decorators) || []; } catch (e) { decs = []; }
                }

                return (
                  <tr key={r.id || r.recordId || i} className="archive-row">
                    {/* THE FIX: Fallback values for every single field so it can never crash */}
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.name || r.patientId || "Unknown"}</td>
                    <td className="mono">{r.age || "--"} / {r.gender || "--"}</td>
                    <td>{r.complaint || "N/A"}</td>
                    <td>{triageBadge(Number(r.triageLevel) || 3)}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{r.admittedAt?.toString?.()?.slice?.(0, 20) || "—"}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{r.dischargedAt?.toString?.()?.slice?.(0, 20) || "—"}</td>
                    <td>
                      {decs.length === 0
                        ? <span style={{ color: "var(--text-muted)", fontSize: 11 }}>None</span>
                        : decs.map((d: any) => {
                          const eq = EQUIPMENT_CATALOG?.find(e => e.key === d);
                          return <span key={d} className="equip-tag" style={{ marginRight: 4 }}>{eq?.icon || "📦"} {eq?.label || d}</span>;
                        })}
                    </td>
                    <td style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      ${(Number(r.billing || r.totalBilledAmount) || 0).toLocaleString()}
                    </td>
                    <td>
                      {r.type === "express"
                        ? <span className="triage-badge t1">EXPRESS</span>
                        : <span className="discharge-badge">STANDARD</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}