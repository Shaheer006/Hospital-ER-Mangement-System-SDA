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
    const availableBed = beds.find(b => b.status === "available");
    if (!availableBed) {
      addAlert({ type: "warn", text: "Express Admit failed — no beds available" });
      return false;
    }

    const p = new PatientProfileBuilder()
      .addName(patientName)
      .addAge(35).addGender("Unknown").addComplaint("Trauma — Express Admit")
      .addVitals({ systolic: 75, diastolic: 50, heartRate: 128, temperature: 36.5, oxygenSat: 88 })
      .calculateTriageScore()
      .build();
    p.status = "admitted"; p.bedId = availableBed.id; p.triageLevel = 1;

    setBeds(prev => prev.map(b => b.id === availableBed.id
      ? { ...b, status: "occupied", patientId: p.id, patientName: p.name, decorators: [], billingTotal: b.billingBase }
      : b));

    setPatients(prev => [...prev, p]);

    eventBus.broadcast("emergency", { bedId: availableBed.id, patientName: p.name, level: 1 });

    addAlert({ type: "crit", text: `🚨 EXPRESS ADMIT: ${patientName} → Bed ${availableBed.id}` });

    // Fix: pass a proper ArchiveRecord shape, not { patient: p, ... }
    addArchiveLog({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      complaint: p.chiefComplaint,
      triageLevel: p.triageLevel,
      admittedAt: new Date().toLocaleString(),
      dischargedAt: "—",
      billing: p.billingBase || 500,
      decorators: [],
      type: "express",
    });

    return true;
  }
}