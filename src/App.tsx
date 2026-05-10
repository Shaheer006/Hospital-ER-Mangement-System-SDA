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
  const isFirstRender = useRef(true);

  useEffect(() => {
    async function loadDB() {
      const data = await DatabaseRepository.fetchInitialData();

      // THE FIX: Explicit, individual fallbacks for EVERY table.
      setBeds(data?.beds?.length > 0 ? data.beds : INITIAL_BEDS);
      setInventory(data?.inventory?.length > 0 ? data.inventory : INITIAL_INVENTORY);
      setArchive(data?.archive?.length > 0 ? data.archive : INITIAL_ARCHIVE);
      setPatients(data?.patients?.length > 0 ? data.patients : []);

      setIsLoaded(true);
      setTimeout(() => { isFirstRender.current = false; }, 500);
    }
    loadDB();
  }, []);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current) DatabaseRepository.syncTable('patients', patients);
  }, [patients, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current) DatabaseRepository.syncTable('beds', beds);
  }, [beds, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current) DatabaseRepository.syncTable('inventory', inventory);
  }, [inventory, isLoaded]);

  useEffect(() => {
    if (isLoaded && !isFirstRender.current) DatabaseRepository.syncTable('archive', archive);
  }, [archive, isLoaded]);

  const addAlert = useCallback((a: Omit<Alert, 'ts'>) => {
    setAlerts(prev => [...prev.slice(-19), { ...a as Alert, ts: new Date() }]);
  }, []);

  const addArchiveLog = useCallback((entry: ArchiveRecord) => {
    setArchive(prev => [...prev, entry]);
  }, []);

  useEffect(() => {
    const unsub = eventBus.subscribe("emergency", ({ patientName, bedId }) => {
      addAlert({ type: "crit", text: `🚨 CODE BLUE · Bed ${bedId} · ${patientName}` });
    });
    return unsub;
  }, [addAlert]);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        Connecting to SQLite Database...
      </div>
    );
  }

  const criticalCount = beds.filter(b => b.status === "critical").length;
  const waitingCount = patients.filter(p => p.status === "waiting").length;
  const erStatus = criticalCount > 0 ? "critical" : waitingCount > 4 ? "warning" : "normal";
  const erStatusLabel = criticalCount > 0 ? `${criticalCount} Code Blue` : waitingCount > 4 ? "High Volume" : "Normal Ops";
  const meta = (PAGE_META as any)[page];

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} page={page} setPage={setPage} criticalCount={criticalCount} waitingCount={waitingCount} alerts={alerts} />
      <main className="main">
        <Topbar label={meta.label} sub={meta.sub} erStatus={erStatus} erStatusLabel={erStatusLabel} />
        <div className="content">
          {page === "admissions" && <AdmissionsPage patients={patients} setPatients={setPatients} beds={beds} setBeds={setBeds} addAlert={addAlert} addArchiveLog={addArchiveLog} setPage={setPage} />}
          {page === "floor" && <ERFloorPage beds={beds} setBeds={setBeds} patients={patients} setPatients={setPatients} inventory={inventory} setInventory={setInventory} addAlert={addAlert} addArchiveLog={addArchiveLog} />}
          {page === "inventory" && <InventoryPage inventory={inventory} setInventory={setInventory} addAlert={addAlert} />}
          {page === "archive" && <ArchivePage archive={archive} />}
        </div>
      </main>
    </div>
  );
}