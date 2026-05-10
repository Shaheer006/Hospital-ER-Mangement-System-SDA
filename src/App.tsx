import { useState, useEffect, useCallback, useRef } from "react";
import { DatabaseRepository } from "./lib/api/Repository";
import { Patient, Bed, InventoryItem, ArchiveRecord, Alert } from "./types";
import { INITIAL_BEDS, INITIAL_INVENTORY, INITIAL_ARCHIVE, PAGE_META } from "./constants";
import { eventBus } from "./lib/patterns/Observer";

import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { AdmissionsPage } from "./components/Admissions/AdmissionsPage";
import { ERFloorPage } from "./components/Floor/ERFloorPage";
import { InventoryPage } from "./components/Inventory/InventoryPage";
import { ArchivePage } from "./components/Archive/ArchivePage";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Numeric coercion helpers (SQLite returns everything as strings) ──────────
function coerceBed(bed: any): Bed {
  return {
    ...bed,
    id: Number(bed.id),
    patientId: bed.patientId === "null" || bed.patientId == null ? null : bed.patientId,
    patientName: bed.patientName === "null" || bed.patientName == null ? null : bed.patientName,
    billingBase: Number(bed.billingBase) || 500,
    billingTotal: Number(bed.billingTotal) || 500,
    decorators: parseJsonField(bed.decorators, []),
    status: bed.status ?? "available",
  };
}

function coercePatient(p: any): Patient {
  return {
    ...p,
    age: Number(p.age) || 0,
    systolic: Number(p.systolic) || 0,
    diastolic: Number(p.diastolic) || 0,
    heartRate: Number(p.heartRate) || 0,
    temperature: Number(p.temperature) || 0,
    oxygenSat: Number(p.oxygenSat) || 0,
    triageScore: Number(p.triageScore) || 0,
    triageLevel: (Number(p.triageLevel) || 3) as 1 | 2 | 3 | 4 | 5,
    billingBase: Number(p.billingBase) || 500,
    bedId: p.bedId === "null" || p.bedId == null ? null : Number(p.bedId),
    decorators: parseJsonField(p.decorators, []),
  };
}

function coerceInventory(i: any): InventoryItem {
  return {
    ...i,
    stock: Number(i.stock) || 0,
    dailyCost: Number(i.dailyCost) || 0,
    unitCost: Number(i.unitCost) || 0,
  };
}

function coerceArchive(r: any): ArchiveRecord {
  return {
    ...r,
    age: Number(r.age) || 0,
    triageLevel: Number(r.triageLevel) || 3,
    billing: Number(r.billing) || 0,
    decorators: parseJsonField(r.decorators, []),
  };
}

function parseJsonField(value: any, fallback: any): any {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      // Handle double-stringified case: '["iv"]' parsed once gives array, fine.
      // But '"[\\"iv\\"]"' parsed once gives a string → parse again.
      if (typeof parsed === "string") {
        return JSON.parse(parsed);
      }
      return parsed;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("floor");
  const [collapsed, setCollapsed] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [archive, setArchive] = useState<ArchiveRecord[]>([]);

  const [alerts, setAlerts] = useState<Alert[]>([
    { type: "info", text: "System online — ER Triage Manager v1.0", ts: new Date() },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const isFirstRender = useRef(true);

  // ── Debounced state for DB sync (prevents hammering on every keystroke) ──────
  const debouncedPatients = useDebounce(patients, 600);
  const debouncedBeds = useDebounce(beds, 600);
  const debouncedInventory = useDebounce(inventory, 600);
  const debouncedArchive = useDebounce(archive, 600);

  // ── Initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadDB() {
      const data = await DatabaseRepository.fetchInitialData();

      // If fetch didn't throw, backend is reachable — null tables just means empty DB
      setDbConnected(true);

      // Coerce all numeric/array fields that SQLite returns as strings
      setBeds(
        data?.beds?.length > 0
          ? data.beds.map(coerceBed)
          : INITIAL_BEDS
      );
      setInventory(
        data?.inventory?.length > 0
          ? data.inventory.map(coerceInventory)
          : INITIAL_INVENTORY
      );
      setArchive(
        data?.archive?.length > 0
          ? data.archive.map(coerceArchive)
          : INITIAL_ARCHIVE
      );
      setPatients(
        data?.patients?.length > 0
          ? data.patients.map(coercePatient)
          : []
      );

      setIsLoaded(true);
      // Wait long enough for all state setters above to have flushed
      setTimeout(() => {
        isFirstRender.current = false;
      }, 800);
    }
    loadDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced sync effects ────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && !isFirstRender.current)
      DatabaseRepository.syncTable("patients", debouncedPatients);
  }, [debouncedPatients, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current)
      DatabaseRepository.syncTable("beds", debouncedBeds);
  }, [debouncedBeds, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current)
      DatabaseRepository.syncTable("inventory", debouncedInventory);
  }, [debouncedInventory, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current)
      DatabaseRepository.syncTable("archive", debouncedArchive);
  }, [debouncedArchive, isLoaded]);

  // ── Alert helper ──────────────────────────────────────────────────────────────
  const addAlert = useCallback((a: Omit<Alert, "ts">) => {
    setAlerts((prev) => [...prev.slice(-19), { ...(a as Alert), ts: new Date() }]);
  }, []);

  // ── Archive helper ─────────────────────────────────────────────────────────────
  const addArchiveLog = useCallback((entry: ArchiveRecord) => {
    setArchive((prev) => [...prev, entry]);
  }, []);

  // ── Observer: emergency events ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = eventBus.subscribe("emergency", ({ patientName, bedId }) => {
      addAlert({ type: "crit", text: `🚨 CODE BLUE · Bed ${bedId} · ${patientName}` });
    });
    return unsub;
  }, [addAlert]);

  // ── Loading screen ─────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14 }}>Connecting to SQLite Database…</div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          If this takes too long, check that the backend is running on port 3001.
        </div>
      </div>
    );
  }

  // ── Derived state ──────────────────────────────────────────────────────────────
  const criticalCount = beds.filter((b) => b.status === "critical").length;
  const waitingCount = patients.filter((p) => p.status === "waiting").length;
  const erStatus =
    criticalCount > 0 ? "critical" : waitingCount > 4 ? "warning" : "normal";
  const erStatusLabel =
    criticalCount > 0
      ? `${criticalCount} Code Blue`
      : waitingCount > 4
        ? "High Volume"
        : "Normal Ops";
  const meta = (PAGE_META as any)[page];

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        page={page}
        setPage={setPage}
        criticalCount={criticalCount}
        waitingCount={waitingCount}
        alerts={alerts}
      />
      <main className="main">
        <Topbar
          label={meta.label}
          sub={meta.sub}
          erStatus={erStatus}
          erStatusLabel={erStatusLabel}
          dbConnected={dbConnected}
        />
        <div className="content">
          {page === "admissions" && (
            <AdmissionsPage
              patients={patients}
              setPatients={setPatients}
              beds={beds}
              setBeds={setBeds}
              addAlert={addAlert}
              addArchiveLog={addArchiveLog}
              setPage={setPage}
            />
          )}
          {page === "floor" && (
            <ERFloorPage
              beds={beds}
              setBeds={setBeds}
              patients={patients}
              setPatients={setPatients}
              inventory={inventory}
              setInventory={setInventory}
              addAlert={addAlert}
              addArchiveLog={addArchiveLog}
            />
          )}
          {page === "inventory" && (
            <InventoryPage
              inventory={inventory}
              setInventory={setInventory}
              addAlert={addAlert}
            />
          )}
          {page === "archive" && <ArchivePage archive={archive} />}
        </div>
      </main>
    </div>
  );
}