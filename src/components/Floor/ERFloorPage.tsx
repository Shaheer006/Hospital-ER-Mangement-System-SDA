import React, { useState, useEffect } from "react";
import { Bed, Patient, InventoryItem, Alert } from "../../types";
import { EQUIPMENT_CATALOG } from "../../constants";
import { eventBus } from "../../lib/patterns/Observer";
import { decorateBed, removeDecorator, getBedBilling } from "../../lib/patterns/Decorator";

interface ERFloorPageProps {
  beds: Bed[];
  setBeds: React.Dispatch<React.SetStateAction<Bed[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addAlert: (a: Omit<Alert, 'ts'>) => void;
  addArchiveLog: (entry: any) => void;
}

export function ERFloorPage({ beds, setBeds, patients, setPatients, inventory, setInventory, addAlert, addArchiveLog }: ERFloorPageProps) {
  const [emergencies, setEmergencies] = useState<{ [key: number]: boolean }>({});
  const [assignModal, setAssignModal] = useState<number | null>(null); // bedId
  const [selectedPatient, setSelectedPatient] = useState("");

  useEffect(() => {
    const unsub = eventBus.subscribe("emergency", ({ bedId }) => {
      setEmergencies(prev => ({ ...prev, [bedId]: true }));
    });
    return unsub;
  }, []);

  const triggerEmergency = (bed: Bed) => {
    // OBSERVER: bed is Subject, broadcasts to all observers
    eventBus.broadcast("emergency", { bedId: bed.id, patientName: bed.patientName, level: 1 });
    setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status: "critical" } : b));
    addAlert({ type: "crit", text: `🚨 CODE BLUE — Bed ${bed.id} (${bed.patientName})` });
  };

  const resolveEmergency = (bed: Bed) => {
    setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status: "occupied" } : b));
    setEmergencies(prev => { const n = {...prev}; delete n[bed.id]; return n; });
    addAlert({ type: "info", text: `✓ Code Blue resolved — Bed ${bed.id}` });
  };

  const addEquipment = (bed: Bed, eqKey: string) => {
    const decorated = decorateBed(bed, eqKey, inventory);
    if (!decorated) { addAlert({ type: "warn", text: `${eqKey} out of stock` }); return; }
    setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, decorators: decorated.decorators, billingTotal: decorated.billingTotal } : b));
    setInventory(prev => prev.map(i => i.key === eqKey ? { ...i, stock: i.stock - 1 } : i));
    const eq = EQUIPMENT_CATALOG.find(e => e.key === eqKey);
    addAlert({ type: "info", text: `${eq?.label} added to Bed ${bed.id} (+$${eq?.dailyCost}/day)` });
  };

  const removeEquipment = (bed: Bed, eqKey: string) => {
    const result = removeDecorator(bed, eqKey, inventory);
    setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, decorators: result.decorators, billingTotal: result.billingTotal } : b));
    setInventory(prev => prev.map(i => i.key === eqKey ? { ...i, stock: i.stock + 1 } : i));
    const eq = EQUIPMENT_CATALOG.find(e => e.key === eqKey);
    addAlert({ type: "info", text: `${eq?.label} removed from Bed ${bed.id}` });
  };

  const assignPatient = (bedId: number) => {
    if (!selectedPatient) return;
    const p = patients.find(pt => pt.id === selectedPatient);
    if (!p) return;
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: "occupied", patientId: p.id, patientName: p.name, decorators: [], billingTotal: b.billingBase } : b));
    setPatients(prev => prev.map(pt => pt.id === p.id ? { ...pt, status: "admitted", bedId } : pt));
    addAlert({ type: "info", text: `${p.name} assigned to Bed ${bedId}` });
    setAssignModal(null); setSelectedPatient("");
  };

  const dischargePatient = (bed: Bed) => {
    const bill = getBedBilling(bed);
    const p = patients.find(pt => pt.id === bed.patientId);
    addArchiveLog({
      id: bed.patientId, name: bed.patientName,
      age: p?.age || "—", gender: p?.gender || "—",
      complaint: p?.chiefComplaint || "—",
      triageLevel: p?.triageLevel || 3,
      admittedAt: p?.arrivedAt ? new Date(p.arrivedAt).toLocaleString() : "—",
      dischargedAt: new Date().toLocaleString(),
      billing: bill, decorators: [...bed.decorators],
    });
    setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status: "available", patientId: null, patientName: null, decorators: [], billingTotal: b.billingBase } : b));
    setPatients(prev => prev.filter(pt => pt.id !== bed.patientId));
    addAlert({ type: "info", text: `${bed.patientName} discharged — Bill: $${bill}` });
  };

  const occupiedBeds = beds.filter(b => b.status !== "available");
  const waitingPatients = patients.filter(p => p.status === "waiting");

  return (
    <div>
      {/* Emergency banners (Observer output) */}
      {beds.filter(b => b.status === "critical").map(b => (
        <div className="emergency-banner" key={b.id}>
          <div className="emergency-dot" />
          <div className="emergency-text">CODE BLUE — Bed {b.id} · {b.patientName}</div>
          <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => resolveEmergency(b)}>Resolve</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {[["Total Beds", beds.length, "var(--accent)"],
          ["Occupied", occupiedBeds.length, "var(--amber)"],
          ["Available", beds.filter(b=>b.status==="available").length, "var(--green)"],
          ["Critical", beds.filter(b=>b.status==="critical").length, "var(--red)"],
        ].map(([label, val, color]) => (
          <div className="card" style={{ flex: 1 }} key={label as string}>
            <div className="card-title">{label}</div>
            <div className="card-value" style={{ color: color as string }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div>
          <div className="section-title">Bed Grid</div>
          <div className="section-sub">Decorator Pattern — attach equipment dynamically to any bed</div>
        </div>
        {waitingPatients.length > 0 && <div style={{ fontSize: 12, color: "var(--amber)" }}>⚠ {waitingPatients.length} patients waiting for bed assignment</div>}
      </div>

      <div className="bed-grid">
        {beds.map(bed => {
          const billing = getBedBilling(bed);
          const isOccupied = bed.status === "occupied" || bed.status === "critical";
          return (
            <div className={`bed-card ${bed.status}`} key={bed.id}>
              <div className="bed-number">BED #{String(bed.id).padStart(2,"0")} · <span style={{ color: bed.status === "available" ? "var(--green)" : bed.status === "critical" ? "var(--red)" : "var(--accent)" }}>{bed.status.toUpperCase()}</span></div>

              {isOccupied ? (
                <>
                  <div className="bed-patient">{bed.patientName}</div>
                  <div className="bed-equip">
                    {(bed.decorators || []).map(d => {
                      const eq = EQUIPMENT_CATALOG.find(e => e.key === d);
                      return <span key={d} className="equip-tag" style={{ cursor: "pointer" }} onClick={() => removeEquipment(bed, d)} title="Click to remove">{eq?.icon} {eq?.label}</span>;
                    })}
                    {bed.decorators.length === 0 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>No equipment</span>}
                  </div>
                  <div className="bed-billing">$ {billing}/day</div>
                  <div className="bed-actions">
                    {EQUIPMENT_CATALOG.map(eq => {
                      const inv = inventory.find(i => i.key === eq.key);
                      const alreadyOn = bed.decorators.includes(eq.key);
                      if (alreadyOn) return null;
                      return (
                        <button key={eq.key} className="btn btn-sm purple-btn" disabled={!inv || inv.stock <= 0} onClick={() => addEquipment(bed, eq.key)} title={`Add ${eq.label}`}>
                          {eq.icon}
                        </button>
                      );
                    })}
                    {bed.status !== "critical" && (
                      <button className="btn btn-sm danger" onClick={() => triggerEmergency(bed)}>🚨</button>
                    )}
                    <button className="btn btn-sm" onClick={() => dischargePatient(bed)}>↗ Discharge</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Unoccupied</div>
                  <button className="btn btn-sm success" style={{ width: "100%" }} onClick={() => { setAssignModal(bed.id); setSelectedPatient(""); }}>+ Assign Patient</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Assign Patient to Bed #{assignModal}</div>
            <div className="form-group">
              <label className="form-label">Select Patient from Waiting Queue</label>
              <select className="form-input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">— Select patient —</option>
                {waitingPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — T{p.triageLevel} · {p.chiefComplaint}</option>
                ))}
              </select>
            </div>
            {waitingPatients.length === 0 && <div style={{ fontSize: 12, color: "var(--amber)", marginBottom: 12 }}>No patients in waiting queue. Admit patients from the Admissions page first.</div>}
            <div className="modal-footer">
              <button className="btn" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn primary" disabled={!selectedPatient} onClick={() => assignPatient(assignModal)}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
