export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSat: number;
  triageScore: number;
  triageLevel: 1 | 2 | 3 | 4 | 5;
  arrivedAt: string;
  status: "waiting" | "admitted";
  bedId: number | null;
  decorators: string[];
  billingBase: number;
  billingTotal?: number;
}

export interface Bed {
  id: number;
  status: "available" | "occupied" | "critical";
  patientId: string | null;
  patientName: string | null;
  decorators: string[];
  billingBase: number;
  billingTotal: number;
}

export interface Equipment {
  key: string;
  label: string;
  dailyCost: number;
  icon: string;
  stock: number;
}

export interface InventoryItem extends Equipment {
  unitCost: number;
}

export interface ArchiveRecord {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  complaint: string;
  triageLevel: number;
  admittedAt: string;
  dischargedAt: string;
  billing: number;
  decorators: string[];
  type?: "express" | "standard";
}

export interface Alert {
  type: "info" | "warn" | "crit";
  text: string;
  ts: Date;
}
