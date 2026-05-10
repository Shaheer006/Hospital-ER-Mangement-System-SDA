import React from "react";
import { Patient, Bed, Alert } from "../../types";
import { PatientProfileBuilder } from "./Builder";
import { eventBus } from "./Observer";

export class AdmissionsFacade {
  static expressAdmit(
    patientName: string,
    beds: Bed[],
    setBeds: React.Dispatch<React.SetStateAction<Bed[]>>,
    patients: Patient[],
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>,
    addAlert: (a: Omit<Alert, 'ts'>) => void,
    addArchiveLog: (entry: any) => void
  ) {
    // Subsystem 1: find first available bed
    const availableBed = beds.find(b => b.status === "available");
    if (!availableBed) {
      addAlert({ type: "warn", text: "Express Admit failed — no beds available" });
      return false;
    }
    // Subsystem 2: build patient record (auto vitals for trauma)
    const p = new PatientProfileBuilder()
      .addName(patientName)
      .addAge(35).addGender("Unknown").addComplaint("Trauma — Express Admit")
      .addVitals({ systolic: 75, diastolic: 50, heartRate: 128, temperature: 36.5, oxygenSat: 88 })
      .calculateTriageScore()
      .build();
    p.status = "admitted"; p.bedId = availableBed.id; p.triageLevel = 1;
    
    // Subsystem 3: assign bed
    setBeds(prev => prev.map(b => b.id === availableBed.id
      ? { ...b, status: "occupied", patientId: p.id, patientName: p.name, decorators: [], billingTotal: b.billingBase }
      : b));
      
    // Subsystem 4: add patient
    setPatients(prev => [...prev, p]);
    
    // Subsystem 5: broadcast Observer event
    eventBus.broadcast("emergency", { bedId: availableBed.id, patientName: p.name, level: 1 });
    
    // Subsystem 6: log
    addAlert({ type: "crit", text: `🚨 EXPRESS ADMIT: ${patientName} → Bed ${availableBed.id}` });
    addArchiveLog({ type: "express", patient: p, bedId: availableBed.id, ts: new Date() });
    return true;
  }
}
