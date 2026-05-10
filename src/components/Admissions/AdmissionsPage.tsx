import React, { useState } from "react";
import { Patient, Bed, Alert } from "../../types";
import { PatientProfileBuilder } from "../../lib/patterns/Builder";
import { AdmissionsFacade } from "../../lib/patterns/Facade";
import { triageBadge, timeAgo } from "../../lib/utils";

interface AdmissionsPageProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  beds: Bed[];
  setBeds: React.Dispatch<React.SetStateAction<Bed[]>>;
  addAlert: (a: Omit<Alert, 'ts'>) => void;
  addArchiveLog: (entry: any) => void;
  setPage: (page: string) => void;
}

export function AdmissionsPage({ patients, setPatients, beds, setBeds, addAlert, addArchiveLog, setPage }: AdmissionsPageProps) {
  const [form, setForm] = useState<any>({ name: "", age: "", gender: "Male", complaint: "", systolic: "", diastolic: "", heartRate: "", temperature: "", oxygenSat: "" });
  const [built, setBuilt] = useState<Patient | null>(null);
  const [step, setStep] = useState(1);
  const [expressName, setExpressName] = useState("");
  const [showExpress, setShowExpress] = useState(false);

  const handleBuild = () => {
    if (!form.name || !form.age) { addAlert({ type: "warn", text: "Name and age required" }); return; }
    const p = new PatientProfileBuilder()
      .addName(form.name).addAge(form.age).addGender(form.gender).addComplaint(form.complaint)
      .addVitals({ systolic: form.systolic || 120, diastolic: form.diastolic || 80, heartRate: form.heartRate || 80, temperature: form.temperature || 37, oxygenSat: form.oxygenSat || 98 })
      .calculateTriageScore().build();
    setBuilt(p); setStep(3);
  };
  const handleAdmit = () => {
    if (!built) return;
    setPatients(prev => [...prev, built]);
    addAlert({ type: "info", text: `Patient ${built.name} added to triage queue (T${built.triageLevel})` });
    setForm({ name: "", age: "", gender: "Male", complaint: "", systolic: "", diastolic: "", heartRate: "", temperature: "", oxygenSat: "" });
    setBuilt(null); setStep(1);
  };
  const handleExpress = () => {
    if (!expressName) return;
    AdmissionsFacade.expressAdmit(expressName, beds, setBeds, patients, setPatients, addAlert, addArchiveLog);
    setExpressName(""); setShowExpress(false);
    setTimeout(() => setPage("floor"), 800);
  };

  const waiting = patients.filter(p => p.status === "waiting").sort((a, b) => a.triageLevel - b.triageLevel || b.triageScore - a.triageScore);
  const admitted = patients.filter(p => p.status === "admitted");

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Waiting</div>
          <div className="card-value accent">{waiting.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Admitted</div>
          <div className="card-value green">{admitted.length}</div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Critical (T1)</div>
          <div className="card-value red">{patients.filter(p => p.triageLevel === 1 && p.status === "waiting").length}</div>
        </div>
        <div className="card" style={{ flex: 1, cursor: "pointer", borderColor: "rgba(255,77,106,0.4)" }} onClick={() => setShowExpress(true)}>
          <div className="card-title" style={{ color: "var(--red)" }}>Express Admit</div>
          <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>⚡ Facade Pattern — 1-click trauma bypass</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Builder Form */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Register Patient</div>
              <div className="section-sub">Builder Pattern — step-by-step record construction</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)", background: step >= s ? "var(--accent-dim)" : "var(--bg-elevated)", color: step >= s ? "var(--accent)" : "var(--text-muted)", border: `1px solid ${step >= s ? "rgba(0,212,255,0.4)" : "var(--border)"}` }}>{s}</div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Patient name" value={form.name} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" placeholder="e.g. 42" value={form.age} onChange={e => setForm((f: any) => ({...f, age: e.target.value}))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm((f: any) => ({...f, gender: e.target.value}))}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chief Complaint</label>
                  <input className="form-input" placeholder="e.g. Chest pain" value={form.complaint} onChange={e => setForm((f: any) => ({...f, complaint: e.target.value}))} />
                </div>
              </div>
              <button className="btn primary" onClick={() => setStep(2)} style={{ width: "100%" }}>Next — Add Vitals →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid-2">
                {[["Systolic BP", "systolic", "mmHg", "e.g. 120"], ["Diastolic BP", "diastolic", "mmHg", "e.g. 80"], ["Heart Rate", "heartRate", "bpm", "e.g. 72"], ["Temperature", "temperature", "°C", "e.g. 37.2"], ["O₂ Saturation", "oxygenSat", "%", "e.g. 98"]].map(([label, key, unit, ph]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label} <span style={{color:"var(--text-muted)"}}>({unit})</span></label>
                    <input className="form-input" type="number" placeholder={ph} value={form[key]} onChange={e => setForm((f: any) => ({...f, [key]: e.target.value}))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                <button className="btn primary" onClick={handleBuild} style={{ flex: 2 }}>Build Profile & Calculate Triage</button>
              </div>
            </>
          )}

          {step === 3 && built && (
            <>
              <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "14px", marginBottom: "14px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{built.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{built.age}y / {built.gender} — {built.chiefComplaint}</div>
                  </div>
                  {triageBadge(built.triageLevel)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {[["BP", `${built.systolic}/${built.diastolic}`], ["HR", `${built.heartRate} bpm`], ["Temp", `${built.temperature}°C`], ["SpO₂", `${built.oxygenSat}%`], ["Score", built.triageScore]].map(([k,v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{v as any}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => setStep(1)} style={{ flex: 1 }}>← Reset</button>
                <button className="btn success" onClick={handleAdmit} style={{ flex: 2 }}>✓ Confirm & Add to Queue</button>
              </div>
            </>
          )}
        </div>

        {/* Triage Queue */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Triage Queue</div>
              <div className="section-sub">Sorted by severity score</div>
            </div>
          </div>
          <div className="scrollable">
            {waiting.length === 0 && <div className="empty-state"><div className="empty-icon">✓</div>No patients waiting</div>}
            {waiting.map((p, i) => (
              <div className="triage-queue-item" key={p.id}>
                <div className="tq-rank">{i + 1}</div>
                <div className="tq-info">
                  <div className="tq-name">{p.name}</div>
                  <div className="tq-meta">{p.age}y {p.gender} · {p.chiefComplaint} · {timeAgo(p.arrivedAt)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {triageBadge(p.triageLevel)}
                  <div className="tq-score" style={{ color: p.triageLevel <= 2 ? "var(--red)" : p.triageLevel === 3 ? "var(--amber)" : "var(--green)", marginTop: 2 }}>{p.triageScore}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Express Admit Modal */}
      {showExpress && (
        <div className="modal-overlay" onClick={() => setShowExpress(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: "var(--red)" }}>⚡ Express Trauma Admit</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--amber)" }}>Facade Pattern</strong> — Coordinates 5 subsystems in one call: finds available bed, builds patient record with critical vitals, assigns bed, broadcasts emergency alert, and logs to archive. Bypasses standard triage queue.
            </div>
            <div className="form-group">
              <label className="form-label">Patient Name / Identifier</label>
              <input className="form-input" placeholder="e.g. Trauma Bay — Unknown Male" value={expressName} onChange={e => setExpressName(e.target.value)} autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowExpress(false)}>Cancel</button>
              <button className="btn danger" onClick={handleExpress}>⚡ Express Admit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
