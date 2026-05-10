import { ArchiveRecord } from "../../types";
import { EQUIPMENT_CATALOG } from "../../constants";
import { triageBadge } from "../../lib/utils";

interface ArchivePageProps {
  archive: ArchiveRecord[];
}

export function ArchivePage({ archive }: ArchivePageProps) {
  const safeArchive = Array.isArray(archive) ? archive : [];

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
          <div className="card-value red">{safeArchive.filter(r => (r as any).type === "express").length}</div>
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
                // Guard: skip anything that isn't a proper archive record
                if (typeof r !== "object" || r === null) return null;
                if (!r.complaint && !r.dischargedAt && !r.name) return null;

                // Safe parse decorators
                let decs: string[] = [];
                if (Array.isArray(r.decorators)) {
                  decs = r.decorators;
                } else if (typeof r.decorators === "string") {
                  try {
                    const parsed = JSON.parse(r.decorators);
                    if (Array.isArray(parsed)) decs = parsed;
                    else if (typeof parsed === "string") {
                      const parsed2 = JSON.parse(parsed);
                      if (Array.isArray(parsed2)) decs = parsed2;
                    }
                  } catch {
                    decs = [];
                  }
                }

                // Safe triage level
                const triageLevel = Number(r.triageLevel);
                const safeTriageLevel = (triageLevel >= 1 && triageLevel <= 5) ? triageLevel : 3;

                // Safe string fields
                const name = typeof r.name === "string" ? r.name : String(r.name ?? "Unknown");
                const age = typeof r.age === "number" ? r.age : Number(r.age) || "--";
                const gender = typeof r.gender === "string" ? r.gender : "--";
                const complaint = typeof r.complaint === "string" ? r.complaint : "N/A";
                const admittedAt = typeof r.admittedAt === "string" ? r.admittedAt.slice(0, 20) : "—";
                const dischargedAt = typeof r.dischargedAt === "string" ? r.dischargedAt.slice(0, 20) : "—";
                const billing = Number(r.billing || r.totalBilledAmount) || 0;
                const recordType = typeof r.type === "string" ? r.type : "standard";

                return (
                  <tr key={r.id || i} className="archive-row">
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{name}</td>
                    <td className="mono">{age} / {gender}</td>
                    <td>{complaint}</td>
                    <td>{triageBadge(safeTriageLevel)}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{admittedAt}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{dischargedAt}</td>
                    <td>
                      {decs.length === 0
                        ? <span style={{ color: "var(--text-muted)", fontSize: 11 }}>None</span>
                        : decs.map((d: string) => {
                          const eq = EQUIPMENT_CATALOG.find(e => e.key === d);
                          return (
                            <span key={d} className="equip-tag" style={{ marginRight: 4 }}>
                              {eq?.icon || "📦"} {eq?.label || d}
                            </span>
                          );
                        })}
                    </td>
                    <td style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      ${billing.toLocaleString()}
                    </td>
                    <td>
                      {recordType === "express"
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