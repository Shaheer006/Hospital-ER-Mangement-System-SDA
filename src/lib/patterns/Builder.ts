import { Patient } from "../../types";

export class PatientProfileBuilder {
  private patient: Patient;

  constructor() {
    this.patient = {
      id: `PT-${Date.now()}`,
      name: "", age: 0, gender: "", chiefComplaint: "",
      systolic: 0, diastolic: 0, heartRate: 0, temperature: 0, oxygenSat: 0,
      triageScore: 0, triageLevel: 5,
      arrivedAt: new Date().toISOString(),
      status: "waiting", bedId: null, decorators: [],
      billingBase: 500,
    };
  }

  addName(name: string) { this.patient.name = name; return this; }
  addAge(age: string | number) { this.patient.age = typeof age === 'string' ? parseInt(age) : age; return this; }
  addGender(gender: string) { this.patient.gender = gender; return this; }
  addComplaint(c: string) { this.patient.chiefComplaint = c; return this; }

  addVitals({ systolic, diastolic, heartRate, temperature, oxygenSat }: {
    systolic: string | number,
    diastolic: string | number,
    heartRate: string | number,
    temperature: string | number,
    oxygenSat: string | number
  }) {
    this.patient.systolic = typeof systolic === 'string' ? parseInt(systolic) : systolic;
    this.patient.diastolic = typeof diastolic === 'string' ? parseInt(diastolic) : diastolic;
    this.patient.heartRate = typeof heartRate === 'string' ? parseInt(heartRate) : heartRate;
    this.patient.temperature = typeof temperature === 'string' ? parseFloat(temperature) : temperature;
    this.patient.oxygenSat = typeof oxygenSat === 'string' ? parseInt(oxygenSat) : oxygenSat;
    return this;
  }

  calculateTriageScore() {
    let score = 0; // Fixed: Start from a healthy baseline of 0

    // 1. Age Risk Factor
    if (this.patient.age < 2 || this.patient.age > 65) score += 15;

    // 2. Chief Complaint Analysis (Keyword Matching)
    const complaint = (this.patient.chiefComplaint || "").toLowerCase();
    if (complaint.match(/(chest|heart|stroke|breath|sob|trauma|unconscious|bleed|head)/)) {
      score += 30; // Critical keywords
    } else if (complaint.match(/(pain|fever|fracture|burn|cut|vomit)/)) {
      score += 10; // Standard keywords
    }

    // 3. Vitals Factor
    if (this.patient.oxygenSat < 90) score += 30;
    else if (this.patient.oxygenSat < 94) score += 15;

    if (this.patient.heartRate > 120 || this.patient.heartRate < 50) score += 20;
    else if (this.patient.heartRate > 100) score += 10;

    if (this.patient.systolic > 180 || this.patient.systolic <= 80) score += 25;
    else if (this.patient.systolic > 140) score += 10;

    if (this.patient.temperature > 39.5 || this.patient.temperature < 35) score += 15;
    else if (this.patient.temperature > 38) score += 5;

    // Cap the severity scale strictly at 100
    score = Math.min(score, 100);
    this.patient.triageScore = score;

    // Fixed: Evenly distributed dynamic threshold brackets
    if (score >= 80) this.patient.triageLevel = 1;
    else if (score >= 60) this.patient.triageLevel = 2;
    else if (score >= 40) this.patient.triageLevel = 3;
    else if (score >= 20) this.patient.triageLevel = 4;
    else this.patient.triageLevel = 5;

    return this;
  }

  build(): Patient { return { ...this.patient }; }
}