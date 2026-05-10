import { Equipment, InventoryItem, Patient, Bed, ArchiveRecord } from "./types";

export const EQUIPMENT_CATALOG: Omit<Equipment, 'stock'>[] = [
  { key: "oxygen",    label: "Oxygen",      dailyCost: 150, icon: "💨" },
  { key: "iv",        label: "IV Drip",     dailyCost: 80,  icon: "💉" },
  { key: "monitor",   label: "ECG Monitor", dailyCost: 200, icon: "📟" },
  { key: "ventilator",label: "Ventilator",  dailyCost: 800, icon: "🫁" },
  { key: "dialysis",  label: "Dialysis",    dailyCost: 600, icon: "🔬" },
];

export const INITIAL_BEDS: Bed[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: "available",
  patientId: null,
  patientName: null,
  decorators: [],
  billingBase: 500,
  billingTotal: 500,
}));

export const INITIAL_INVENTORY: InventoryItem[] = EQUIPMENT_CATALOG.map(eq => ({
  ...eq,
  stock: eq.key === "ventilator" ? 2 : eq.key === "dialysis" ? 1 : 5,
  unitCost: eq.dailyCost,
}));

export const INITIAL_ARCHIVE: ArchiveRecord[] = [
  { id: "PT-001", name: "Zara Ahmed", age: 45, gender: "Female", complaint: "Fracture", triageLevel: 3, admittedAt: "2026-05-09 08:14", dischargedAt: "2026-05-09 16:40", billing: 1280, decorators: ["iv", "monitor"] },
  { id: "PT-002", name: "Bilal Siddiqui", age: 33, gender: "Male", complaint: "Appendicitis", triageLevel: 2, admittedAt: "2026-05-09 10:22", dischargedAt: "2026-05-09 22:10", billing: 2050, decorators: ["iv", "monitor", "oxygen"] },
];

export const TRIAGE_LABELS: Record<number, string> = {
  1: "IMMEDIATE",
  2: "URGENT",
  3: "LESS URGENT",
  4: "NON-URGENT",
  5: "DISCHARGEABLE"
};

export const TRIAGE_COLORS: Record<number, string> = {
  1: "t1",
  2: "t2",
  3: "t3",
  4: "t4",
  5: "t5"
};

export const PAGE_META = {
  admissions: { label: "Admissions", icon: "🏥", sub: "Builder Pattern" },
  floor: { label: "ER Floor", icon: "🛏", sub: "Decorator + Observer" },
  inventory: { label: "Inventory", icon: "📦", sub: "Stock Control" },
  archive: { label: "Archive", icon: "📋", sub: "Facade Pattern" },
};
